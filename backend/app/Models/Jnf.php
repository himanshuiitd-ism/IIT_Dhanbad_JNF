<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jnf extends Model
{
    protected $guarded = [];

    protected $casts = [
        'eligible_degrees' => 'array',
        'eligible_departments' => 'array',
        'selection_shortlisting' => 'array',
        'selection_tests' => 'array',
        'selection_rounds' => 'array',
        'selection_ppt' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
