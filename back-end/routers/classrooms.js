const router = require("express").Router();
const { Classroom } = require("../models");
const { createResponse } = require("../server/util");
const { getResource, logEvent, logError } = require("../server/util");
const { ClassEvent, Messages } = require("../models/events");

// creating a classroom
router.post("/", async (req, res) => {
  try {
    const { title, description, students, teachers } = req.body;
    if (!title || !description) {
      throw new Error("No title or description supplied.");
    }
    const classroom = new Classroom({ title, description, students, teachers });
    let promises = [];
    teachers.forEach(teacher => {
      teacher = User.findById(teacher);
      teacher.classrooms.push(classroom);
      promises.push(teacher.save());
    });
    students.forEach(student => {
      student = User.findById(student);
      student.classrooms.push(classroom);
      promises.push(student.save());
    });
    promises.push(classroom.save());

    // Create log event.
    logEvent(
      ClassEvent,
      {
        message: Messages.TEMPLATE_CLASSROOM_CREATE,
        owner: req.user,
        class: classroom
      },
      false
    );

    await Promise.all(promises);
    res.json(createResponse(classroom));
  } catch (error) {
    logError(error);
    res.json(createResponse(error));
  }
});

// reading a classroom
router.get("/:id", async (req, res) => {
  try {
    const classroom = await getResource(
      req.params.id,
      Classroom.findById.bind(Classroom)
    );

    // Create log event.
    logEvent(ClassEvent, {
      message: Messages.TEMPLATE_CLASSROOM_READ,
      owner: req.user,
      class: classroom
    });

    res.json(createResponse(classroom));
  } catch (error) {
    logError(error);
    res.json(createResponse(error));
  }
});

// updating a classroom
router.patch("/:id", async (req, res) => {
  try {
    const { updates } = req.body;
    const classroom = await getResource(
      req.params.id,
      Classroom.findByIdAndUpdate.bind(Classroom),
      updates
    );

    let promises = [];
    if (updates.teachers) {
      updates.teachers.forEach(teacher => {
        teacher = User.findById(teacher);
        teacher.classrooms.push(classroom);
        promises.push(teacher.save());
      });
    }
    if (updates.students) {
      students.forEach(student => {
        student = User.findById(student);
        student.classrooms.push(classroom);
        promises.push(student.save());
      });
    }

    // Create log event.
    classroom.fields = Object.keys(updates).join(",");
    classroom.values = Object.values(updates).join(",");
    logEvent(ClassEvent, {
      message: Messages.TEMPLATE_CLASSROOM_UPDATE,
      owner: req.user,
      class: classroom
    });

    await Promise.all(promises);
    res.json(createResponse(classroom));
  } catch (error) {
    logError(error);
    res.json(createResponse(error));
  }
});

// deleting a classroom
router.delete("/:id", async (req, res) => {
  try {
    const classroom = await getResource(
      req.params.id,
      Classroom.findByIdAndRemove.bind(Classroom)
    );

    // Create log event.
    logEvent(ClassEvent, {
      message: Messages.TEMPLATE_CLASSROOM_DELETE,
      owner: req.user,
      class: classroom
    });

    res.json(createResponse(classroom));
  } catch (error) {
    logError(error);
    res.json(createResponse(error));
  }
});

module.exports = router;
