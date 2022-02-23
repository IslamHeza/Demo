<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Conner\Likeable\Likeable;

use App\Models\Comment;

class Project extends Model

{
    use  Likeable;

    protected $fillable = [
        'title', 'text', 'technician_id', 'sub_category_id', 'category_id', 'sub_category_id', 'publishing',
        'cover_image', 'images', 'video','views'
    ];

    public function technician()
    {
        return $this->belongsTo(Technician::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategories(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_sub_category', 'project_id', 'sub_category_id');
    }

    public function comments(){

      return  $this->hasMany(Comment::class);

    }

}
