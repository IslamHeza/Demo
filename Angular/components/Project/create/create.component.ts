import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from 'src/app/Services/category.service';
import { ProjectService } from 'src/app/Services/project.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  categories: any = [];
  subCategories: any = [];
  form: FormGroup;
  submitted = false;
  previews: any[] = [];
  selectedFiles: any = [];
  imgs: any[] = [];
  coverImage?: File;
  profile: any = [];
  coverLable: any;

  constructor(private formBuilder: FormBuilder, private router: Router, private categoryService: CategoryService, private projectService: ProjectService) {

    this.profile = JSON.parse(localStorage.getItem("user") || '{}');
    this.form = this.formBuilder.group(
      {
        title: ['', [Validators.required, Validators.minLength(5)]],
        text: ['', [Validators.required, Validators.minLength(5)]],
        category_id: ['', Validators.required],
        sub_category_id: ['', Validators.required,],
        cover_image: ['', Validators.required],
        images: [null, Validators.required],
        publishing: 'published',
      }
    );
  }

  ngOnInit(): void {

    //load Main Catagories which required to create a project
    this.mainCatagories();

  }

  mainCatagories() {
    return this.categoryService.getMainCatagories().subscribe(res => {
      this.categories = res;
    })
  }

  //load sub Categories after select a main category.
  data: any;
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

  // Patch images to the form
  patchValues(img: any) {
    this.form.patchValue({
      images: img,
    });
  }


  setCoverImg(index: any) {
    if (this.imgs) {
      this.coverImage = this.imgs[index];
      this.coverLable = this.previews[index];
      this.form.patchValue({
        cover_image: this.imgs[index]
      });

    }
  }


  deletePreview(index: any) {
    //reset cover image if the deleted image was set as cover image
    if (this.coverImage == this.imgs[index]) {
      this.form.patchValue({
        cover_image: null
      });
    }

    //deleting image from previews
    if (this.previews && this.previews[0]) {
      this.previews.splice(index, 1);
      this.imgs.splice(index, 1);
    }
  }


  //save project without puplishing.
  save() {
    this.form.patchValue({
      publishing: 'unpublished',
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


  //submit the project
  submit() {
    //validate the form befor submitting.
    this.submitted = true;
    if (this.form.invalid) {
      console.log('invalid');
      return;
    }

    //prepare form data
    const formData = new FormData();

    formData.append('title', this.form.value.title);
    formData.append('category_id', this.form.value.category_id);
    formData.append('sub_category_id', this.form.value.sub_category_id);
    formData.append('cover_image', this.form.value.cover_image);
    formData.append('publishing', this.form.value.publishing);
    formData.append('text', this.form.value.text);

    for (var i = 0; i < this.imgs.length; i++) {
      formData.append("images[]", this.imgs[i]);
    }

    this.projectService.createProject(formData).subscribe((res: any) => {
      if (res.data) {
        Swal.fire({
          icon: 'success',
          title: 'شكرا لك',
          text: 'تم إنشاء المشروع بنجاح',
          timer: 2000
        })
      }
      this.router.navigate(['/profile'])
    })
  }
}
