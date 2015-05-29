'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var enu = {
    //values: 'opening open closing closed'.split(' '),
    values: 'matched notmatched dismissed'.split(' '),
    message: 'enum validator failed for path `{PATH}` with value `{VALUE}`'
};

/**
 * Author Schema
 */
var AuthorSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    idSource: {
        type: String,
        default: '',
        trim: true,
    },
    prefered: {
        type: String,
        default: '',
        trim: true,
        required: 'Prefered name cannot be blank'
    },
    date: {
        type: String,
        default: '',
        trim: true
    },
    updated: { 
        type: Date, 
        default: Date.now 
    },
    names: {
        type: String,
        default: '',
        trim: true
    },
    dateName: {
        type: String,
        default: '',
        trim: true
    },
    viaf: {
        type: String,
        default: '',
        trim: true
    },
    revised: {
        type: Boolean,
        default: false
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    state: { 
        type: String, 
        enum: enu,
        default: 'notmatched' 
    }
});

mongoose.model('Author', AuthorSchema);
