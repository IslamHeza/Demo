import { Component, Input, OnInit, Output , EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from 'src/app/Services/project.service';
import { environment } from 'src/environments/environment';
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css' ]
})
export class ViewProjectComponent implements OnInit {
@Input() project_id : any ;
@Output() view = new EventEmitter<boolean>();

project:any = [] ;
localUrl = environment.API_URL;
dateString:any ;

  constructor(private projectServices:ProjectService , private rout:ActivatedRoute) { 

  }
   
  ngOnInit(): void {
    this.getProject();
    
  }

  //close the project modal after close button clicked
  closeView(){
    this.view.emit(false) ;
  }

  data:any ;
  getProject(){
    console.log(this.project_id);
    
    this.projectServices.getProject(this.project_id).subscribe(res=>{
      if(res){
        console.log(res);
        
        this.data = res ;
        this.project = this.data.data?.project ;
        this.dateString = formatDate(this.project?.created_at,'yyyy-MM-dd','en_US');

        this.isSaved();
        this.isLiked();
      }
    })
  }

  status : any ;

  isLiked(){
    return this.projectServices.isLiked(this.project_id).subscribe(res=>{
      console.log(res);
      this.status = res ;
    });
  }

  likeProject(id:any){
    return this.projectServices.likeProject(id).subscribe(res=>{
      console.log();
      this.getProject();
      this.isLiked();
    });
  }

  saved:any ;
  isSaved(){
    return this.projectServices.isSaved(this.project_id).subscribe(res=>{
      console.log();
      this.saved = res ;
    });
  }

  saveProject(){
    this.projectServices.saveProject(this.project_id).subscribe(res=>{
      console.log(res);
      this.isSaved();
    })
  }
}
