import { Component, Input, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/Services/project.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() project_id: any;

  comments: any = [];
  form: FormGroup;
  submitted = false;
  apiUrl = environment.API_URL;
  currentUser = JSON.parse(localStorage.getItem("user") || '{}')

  constructor(private __project: ProjectService, private formBuilder: FormBuilder) {
    //create comment form
    this.form = this.formBuilder.group(
      {
        body: ['', Validators.required],
        project_id: [this.project_id, Validators.required]
      }
    );
  }


  ngOnInit(): void {
    //load project comments
    this.getComments(this.project_id);
  }

  //load project comments
  getComments(id: any) {
    return this.__project.getProjectComments(id).subscribe(res => {
      this.comments = res;
    })
  }

  createComment() {
    this.form.patchValue({
      project_id: this.project_id
    })


    if (this.form.valid) {
      this.submitted = true;

      this.__project.createComment(this.form.value).subscribe(res => {
        console.log(res);
        this.getComments(this.project_id);
      })
      this.form.reset();
    } else {
      console.log('Invalid comment');
      return
    }
  }

}
