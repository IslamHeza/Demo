import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  baseUrl = environment.API_URL+"api/v1/";

  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
  })

  //to change content-type to (multipart/form-data) instead of (application/json) as Angular will change it when send form data.
  fileheaders = new HttpHeaders({
    'Authorization': 'Bearer' + localStorage.getItem('access_token') 
  }).delete('Content-Type'); 


  constructor(private httpClient: HttpClient) { }

  getProject(id: number) {
    return this.httpClient.get(this.baseUrl + 'get-project/' + id, { headers: this.headers });
  }

  getProjects() {
    return this.httpClient.get(this.baseUrl + 'guest/home-projects', { headers: this.headers });
  }

  getSubProjects(subCategory: number) {
    return this.httpClient.get(this.baseUrl + 'guest/sub-categories-projects/' + subCategory, { headers: this.headers });
  }

  createProject(formData: any) {
    return this.httpClient.post(this.baseUrl + 'technician/create-project', formData, { headers: this.fileheaders });
  }

  getProjectComments(id:number){
    return this.httpClient.get(this.baseUrl + 'comments/' + id, { headers: this.headers });
  }

    createComment(comment:any){
    return this.httpClient.post(this.baseUrl + 'comments/store', comment, { headers: this.headers });
  }
  
  likeProject(id:any){
    return this.httpClient.post(this.baseUrl + 'projects/like-unlike/'+id, { headers: this.headers });
  }

  isLiked(id:any){
    return this.httpClient.get(this.baseUrl + 'projects/isLiked/'+id, { headers: this.headers });
  }

  saveProject(id:any){
    return this.httpClient.post(this.baseUrl + 'projects/save-unsave/'+id, { headers: this.headers });
  }

  isSaved(id:any){
    return this.httpClient.get(this.baseUrl + 'projects/is-saved/'+id, { headers: this.headers });
  }

  publish_unpublish(id:any){
    return this.httpClient.post(this.baseUrl + 'projects/publish-unpublish/'+id, { headers: this.headers });
  }

  deleteProject(id:any){
    return this.httpClient.delete(this.baseUrl + 'projects/destroy/'+id, { headers: this.headers });
  }

  editProject(id:any , data:any){
    return this.httpClient.post(this.baseUrl + 'projects/update/'+id,data, { headers: this.fileheaders });
  }

  changeCover(id:any , cover:any){
    return this.httpClient.post(this.baseUrl + 'projects/change-cover/'+id,cover, { headers: this.fileheaders });
  }

  deleteImage(id:any , image:any){
    return this.httpClient.post(this.baseUrl + 'projects/images/delete/'+id,image, { headers: this.headers });
  }

  search(text:string){
    return this.httpClient.post(this.baseUrl + 'projects/search', text, { headers: this.headers });
  }


}
