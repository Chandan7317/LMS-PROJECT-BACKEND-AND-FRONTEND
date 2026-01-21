const { model, Schema } = require("mongoose");

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlenght: [8, "Title must be atleast 8 characters"],
      maxlenght: [50, "Title cannot be more than 50 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlenght: [20, "Description must be atleast 20 characters long"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },

    lectures: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        lecture: {
          public_id: {
            type: String,
            required: true,
          },
          secure_url: {
            type: String,
            required: true,
          },
        },
      },
    ],

    thumbnail: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    numberOfLectures: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: [true, "Course instructor name is required"],
    },
  },
  {
    timestamps: true,
  }
);

const myCourse = model("Course", courseSchema);

module.exports = myCourse;
