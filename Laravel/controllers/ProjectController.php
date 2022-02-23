<?php

namespace App\Http\Controllers\API\FrontEnd;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use App\Models\Project;
use App\Models\Category;
use Notification;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

use App\Notifications\ActionsNotification;

class ProjectController extends Controller
{
    public function get_project(Project $project)
    {
        $project->images = json_decode($project->images);
        //increase views by 1 for every view project 
        $project->views += 1;
        $project->save();

        $project->user_name = $project->technician->user->first_name . " " . $project->technician->user->last_name;
        $project->user_image = $project->technician->user->image;
        $project->comments_count = $project->comments->count();
        $project->user_id = $project->technician->user->id ;
        
        return response()->json(['data' => [
            'project' => $project
        ]]);
    }


    public function update(Request $request, Project $project)
    {
        //Inputs Validation
        $data = $request->validate([
            'title' => 'required|min:3|max:190',
            'text' => 'nullable|string|max:190',
            'publishing' => 'required|in:published,unpublished',
            'category_id' => 'required|exists:categories,id',
            'sub_category_id' => 'required|exists:sub_categories,id',
            'images[]' => 'nullable|array|max:10|image|mimes:jpeg,png,jpg,gif,svg',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
            'oldImages[]' => 'nullable|array|string',
            'oldImages.*' => 'nullable|string'
        ]);

        if ($request->validate ? $request->validate->errors() : false) {
            return response()->json($request->validate->errors(), 400);
        } else {
            
            $photos = [];

            //if new images uploades
            if (isset($data['images'])) {
                //store new images
                foreach ($data['images'] as $key => $photo) {

                    $destinationPath = 'image/projects/images/';
                    $profileImage =  "$destinationPath" . date('YmdHis') . "." . Str::random(10) . '.' . $photo->getClientOriginalExtension();
                    $photo->move($destinationPath, $profileImage);
                    array_push($photos, $profileImage);
                }
            }

            //mrege old images with the new images
            if (isset($data['oldImages'])) {
                $data['images'] = array_merge($photos, $data['oldImages']);
            } else {
                $data['images'] = $photos;
            }

            $project->update($data);

            return response()->json([
                'data' => $project,
                'message' => 'تم تعديل المشروع بنجاح'
            ]);
        }
    }

    public function like_unlike_project(Project $project)
    {
        $notification = [];

        if ($project->liked()) {
            $project->likes -= 1;
            $project->unlike();

            //for notifications
            $message = "Project unliked successfully!";
        } else {
            $project->likes += 1;
            $project->like();

            //for notifications
            $notification = [
                'type' => 'like',
                'related_id' => $project->id,
                'related_title' => $project->title,
            ];

            $message = "Project liked successfully!";

            if (!(auth()->user()->technician == $project->technician)) {
                Notification::send($project->technician->user, new ActionsNotification($notification));
            }
        }

        $project->save();

        return response()->json(['message' => $message]);
    }

    public function isLiked(Project $project)
    {
        $status = $project->Liked();
        if ($status) {
            return response()->json(['status' => true]);
        } else {
            return response()->json(['status' => false]);
        }
    }


    public function save_unsave(Request $request, Project $project)
    {
        try {
            $saved = auth()->user()->saved_projects()->where('project_id', $project->id)->get();

            count($saved) == 0 ? auth()->user()->saved_projects()->attach($project)
                : auth()->user()->saved_projects()->detach($project);

            return response()->json(['status' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error With Saving', 'message' => $e]);
        }
    }


    public function isSaved(Project $project)
    {
        $saved = auth()->user()->saved_projects()->where('project_id', $project->id)->get();

        if (count($saved) > 0) {
            return response()->json(['status' => true]);
        }
        return response()->json(['status' => false]);
    }




    public function destroy(Project $project)
    {
        //auth validation 
        if ($project && $project->technician->id == auth()->user()->technician->id) {

            //delete project images before  delete it
            foreach (json_decode($project->images) as $key => $image) {
                if (File::exists($image)) {
                    File::delete($image);
                }
            }

            if (File::exists($project->cover_image)) {
                File::delete($project->cover_image);
            }

            $project->delete();

            return response(['message' => __('msgs.project.deleted')]);
        } else {
            return response(['error' => 'Forbidden'], 403);
        }
    }


    public function changeCoverImage(Request $request, Project $project)
    {
        $data = $request->validate([
            'cover_image' => 'required|image|mimes:jpeg,png,jpg,gif,svg',
        ]);

        $technician = auth('api')->user()->technician;

        if ($request->validate ? $request->validate->errors() : false) {
            return response()->json($request->validate->errors(), 400);
        } else {


            if ($technician->id == $project->technician->id) {
                if ($coverImage = $request->file('cover_image')) {
                    if (File::exists($project->cover_image)) {
                        File::delete($project->cover_image);
                    }

                    $destinationPath = 'image/projects/covers/';
                    $coverName =  "$destinationPath" . date('YmdHis') . "." . Str::random(10) . '.' . $coverImage->getClientOriginalExtension();
                    $coverImage->move($destinationPath, $coverName);
                    $data['cover_image'] = $coverName;

                    $project->update($data);

                    return response()->json([
                        'message' => 'Cover Image changed successfully',
                        'cover_image' => $project->cover_image,
                    ]);
                } else {
                    return response()->json([
                        'error' => 'Forbidden',
                    ], 403);
                }
            }
        }
    }


    public function deleteImage(Request $request, Project $project)
    {
        $data = $request->validate([
            'image' => 'required|string',
        ]);

        $technician = auth('api')->user()->technician;

        if ($request->validate ? $request->validate->errors() : false) {
            return response()->json($request->validate->errors(), 400);
        } else {

            if ($technician->id == $project->technician->id) {
                if ($coverImage = $request['image']) {
                    if (File::exists($coverImage)) {
                        File::delete($coverImage);
                    }

                    $images = json_decode($project->images);
                    foreach ($images as $key => $url) {
                        if ($url == $request['image']) {
                            array_splice($images, $key, 1);
                        }
                    }


                    $project->images = $images;
                    $project->save();

                    return response()->json([
                        'message' => 'Image Removed successfully',
                        'images' => $project->images,
                    ]);
                } else {
                    return response()->json([
                        'error' => 'Forbidden',
                    ], 403);
                }
            }
        }
    }


    public function publishUnPublish(Project $project)
    {

        if ($project->publishing == 'published') {

            $project->publishing = 'unpublished';
            $msg = __('msgs.project.unpublished');
        } else {
            $project->publishing = 'published';
            $msg = __('msgs.project.published');
        }
        $project->save();
        return response()->json(['message' => $msg]);
    }

}
