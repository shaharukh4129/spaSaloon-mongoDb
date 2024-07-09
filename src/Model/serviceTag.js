// 'use strict';
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const tags = new Schema(
//   {
//     tags: { type: String },
//     status: { type: Boolean, default: false },
//     level: [{ type: mongoose.Types.ObjectId, ref: 'level' }],
//     subcategoryId: [{ type: mongoose.Types.ObjectId, ref: 'subCategory' }],
//     searchTerms: [],
//     tagStatus: { type: Number, default: 0 },
//     displayTag: [],
//     extraone: { type: String },
//     extratwo: { type: String }
//   },

//   {
//     timestamps: true,
//   }
// );
// // tags.index( { tags: "text" } )
// module.exports.tags = mongoose.model('tags', tags);


const mongoose = require("mongoose");

const tags = new mongoose.Schema(
    {
        tags: { type: String },
        status: { type: Boolean, default: false },
        level: [{ type: mongoose.Types.ObjectId, ref: 'level' }],
        subcategoryId: [{ type: mongoose.Types.ObjectId, ref: 'subCategory' }],
        searchTerms: [],
        tagStatus: { type: Number, default: 0 },
        displayTag: [],
        extraone: { type: String },
        extratwo: { type: String }
      },
    
      {
        timestamps: true,
      }
);
module.exports = mongoose.model("tags", tags);