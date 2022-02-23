import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/Services/category.service';
import { ProjectService } from 'src/app/Services/project.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit {

  categories: any = [];
  subCategories: any = [];

  form: FormGroup;
  changeCoverForm: FormGroup;
  deletImageForm: FormGroup;

  submitted = false;
  previews: any[] = [];
  selectedFiles: any = [];
  imgs: any[] = [];
  profile: any = [];
  coverLable: any;
  project: any = []; //using (any) type instead of (Project) type is temporary .
  project_id: any;
  ApiUrl = environment.API_URL;
  oldImages: any = [];

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private categoryService: CategoryService, private projectService: ProjectService, private router: Router) {
    this.profile = JSON.parse(localStorage.getItem("user") || '{}');
    this.project_id = this.route.snapshot.params.id;

    this.form = this.formBuilder.group(
      {
        title: ['', [Validators.required, Validators.minLength(5)]],
        text: '',
        category_id: ['', Validators.required],
        sub_category_id: ['', Validators.required,],
        images: null,
        publishing: 'published',
        oldImages: [null],
      }
    );

    //change cover image form
    this.changeCoverForm = this.formBuilder.group(
      {
        cover_image: [null, Validators.required],
      }
    );

    //delete image form
    this.deletImageForm = this.formBuilder.group(
      {
        image: [null, Validators.required],
      }
    );
  }


  ngOnInit(): void {
    //load Main Catagories which required to create a project
    this.mainCatagories();
    //load current project data
    this.getProject();
  }

  //load Main Catagories which required to create a project
  mainCatagories() {
    this.categoryService.getMainCatagories().subscribe(res => {
      console.log(res);
      this.categories = res;
    })
  }

  //load current project data
  data: any;
  projectData: any;
  getProject() {
    this.projectService.getProject(this.project_id).subscribe(res => {
      if (res) {
        this.projectData = res;
        this.project = this.projectData.data?.project;
        this.oldImages = this.project.images;
        this.coverPreview = this.ApiUrl + this.project.cover_image;
      }
      this.categoryService.getCategory(this.project.category_id).subscribe(res => {
        this.data = res;
        this.subCategories = this.data.data[0].subCategories;
      })
    })
  }

  //load sub Categories after select a main category.
  onChange(category: any) {

    if (category) {
      return this.categoryService.getCategory(category.target.value).subscribe(res => {
        this.data = res;
        this.subCategories = this.data.data[0].subCategories;
      })
    } else {
      return null
    }
  }

  //return form controls.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  //**********old Images **********//
  //handling preview of selected cover image .
  coverImage: any;
  coverPreview: any;
  selectCover(cover: any) {
    this.coverImage = cover.target.files[0];
    if (this.coverImage) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        console.log(e.target.result);
        this.coverPreview = e.target.result;
      };
      reader.readAsDataURL(this.coverImage);
    }

    //patch cover image to the form
    this.changeCoverForm.patchValue({
      cover_image: this.coverImage
    })

  }


  //submit project cover image
  changeCover() {

    if (this.changeCoverForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('cover_image', this.changeCoverForm.value.cover_image);
    this.projectService.changeCover(this.project.id, formData).subscribe(res => {
    })
  }


  //permanent delete of one of current images.
  deleteData: any;
  deleteOldImage(image: any, index: any) {
    this.deletImageForm.patchValue({ image: image })
    this.projectService.deleteImage(this.project.id, this.deletImageForm.value).subscribe(res => {

      if (res) {
        this.oldImages.slice(index, 1);
        this.deleteData = res;
        this.oldImages = this.deleteData.images;
      }
    })
  }

  //**********End of old Images **********//

  //handling preview of images then patch them to the form after user selection .
  selectFiles(event: any) {
    //reset previews array to reload it after new selection.
    if (this.previews.length > 0) this.previews = [];

    //store selected images in selectedFiles array .
    Array.from(event.target.files).forEach(image => {
      this.selectedFiles.push(image);
    });

    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;

      for (let i = 0; i < numberOfFiles; i++) {
        this.imgs[i] = this.selectedFiles[i];

        //images preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews.push(e.target.result);
          //patch the images to the form
          this.patchValues(this.imgs[i]);
        };
        reader.readAsDataURL(this.selectedFiles[i]);
      }
    }
  }

  // Patch form images
  patchValues(img: any) {
    this.form.patchValue({
      images: img,
    });
  }

//delete one of the images preview
  deletePreview(index: any) {
    if (this.previews && this.previews[0]) {
      this.previews.splice(index, 1);
      this.imgs.splice(index, 1);
    }
  }


  //save project without puplishing.
  save() {

    this.changeCover()

    this.form.patchValue({
      publishing: 'unpublished',
      oldImages: this.oldImages ? this.oldImages : []
    });

    this.submit()
  }

  //save project with puplishing.
  publish() {
    this.form.patchValue({
      publishing: 'published',
    });
    this.submit()
  }


  submit() {
    this.submitted = true;
    console.log(this.form.value);

    if (this.form.invalid) {
      console.log('invalid');
      return;
    }

    const formData = new FormData();

    formData.append('title', this.form.get('title')?.value);
    formData.append('text', this.form.get('text')?.value);
    formData.append('category_id', this.form.get('category_id')?.value);
    formData.append('sub_category_id', this.form.get('sub_category_id')?.value);
    formData.append('publishing', this.form.get('publishing')?.value);

    for (var i = 0; i < this.imgs.length; i++) {
      formData.append("images[]", this.imgs[i]);
    }
    for (var i = 0; i < this.oldImages.length; i++) {
      formData.append("oldImages[]", this.oldImages[i]);
    }

    this.projectService.editProject(this.project_id, formData).subscribe((res: any) => {
      console.log(res);

      if (res.data) {
        Swal.fire({
          icon: 'success',
          title: 'شكرا لك',
          text: 'تم تعديل المشروع بنجاح',
          timer: 2000
        })
      }
      this.router.navigate(['/profile'])
    })
  }


  /******* for downloading images from backend (under development !!). ********/

  // toDataURL = async (url:any) => {
  //   console.log("Downloading image...");
  //   var res = await fetch(url, { mode: 'cors'});
  //   var blob = await res.blob();

  //   const result = await new Promise((resolve, reject) => {
  //     var reader = new FileReader();
  //     reader.addEventListener("load", function () {
  //       resolve(reader.result);
  //     }, false);

  //     reader.onerror = () => {
  //       return reject(this);
  //     };
  //     reader.readAsDataURL(blob);
  //   })
  //   this.previews.push(result);
  //   return result
  // };


}
