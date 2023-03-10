const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const validate = require("../controllers/helper/validate");
var { expressjwt: jwt } = require("express-jwt");
require("dotenv").config();

router.get("/", async (req, res, next) => {
  try {
    const student = await studentController.getAllStudents();
    return res.status(200).json({
      student,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      msg: "Student not found",
    });
  }
});

router.get(
  "/:id",
  jwt({ secret: process.env.SECRET, algorithms: ["HS256"] }),
  async (req, res, next) => {
    const targetId = req.params.id;
    try {
      const student = await studentController.getStudentById(targetId);
      if (student) {
        return res.status(200).json({
          student,
        });
      }
      return res.status(404).json({
        msg: "Student not found",
      });
    } catch (err) {
      console.log(err);
      return res.status(404).json({
        msg: "Student not found",
      });
    }
  }
);

router.post(
  "/",
  jwt({ secret: process.env.SECRET, algorithms: ["HS256"] }),
  validate.checkAdminPrivilege,
  async (req, res, next) => {
    const { name, enrollmentNumber, subjects, email, password } = req.body;
    try {
      const student = await studentController.createStudent(
        name,
        enrollmentNumber,
        subjects,
        email,
        password
      );
      return res.status(201).json({
        student,
      });
    } catch (err) {
      return res.status(400).json({
        validationError: err,
      });
    }
  }
);

router.put(
  "/:id",
  jwt({ secret: process.env.SECRET, algorithms: ["HS256"] }),
  validate.checkAdminPrivilege,
  async (req, res, next) => {
    const targetId = req.params.id;
    try {
      const { name, enrollmentNumber, subjects, email, password } = req.body;
      const student = await studentController.updateStudent(
        targetId,
        name,
        enrollmentNumber,
        subjects,
        email,
        password
      );
      return res.status(200).json({
        student,
      });
    } catch (err) {
      console.log(err)
      return res.status(400).json({
        validationError: err,
      });
    }
  }
);

router.delete(
  "/:id",
  jwt({ secret: process.env.SECRET, algorithms: ["HS256"] }),
  validate.checkAdminPrivilege,
  async (req, res, next) => {
    try {
      const student = await studentController.deleteStudent(req.params.id);
      return res.status(200).json({
        msg: "Student deleted successfully",
      });
    } catch (err) {
      return res.status(400).json({
        validationError: err,
      });
    }
  }
);

module.exports = router;
