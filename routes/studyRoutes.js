const express = require("express");

const router = express.Router();

const db = require("../config/db");

/*
PLACEHOLDER USER

Replace with:

req.session.user.user_id

when authentication is completed
*/

const USER_ID = 1;



router.get("/sessions", async (req, res) => {

    const [sessions] = await db.query(

        `SELECT *
         FROM study_sessions
         WHERE user_id = ?
         ORDER BY study_date ASC`,

        [USER_ID]

    );

    res.render("sessions", {
        sessions
    });

});



router.post("/sessions/add", async (req, res) => {

    const {
        topic,
        subject,
        description,
        study_date,
        duration_minutes
    } = req.body;

    await db.query(

        `INSERT INTO study_sessions
        (
            user_id,
            topic,
            subject,
            description,
            study_date,
            duration_minutes
        )

        VALUES (?, ?, ?, ?, ?, ?)`,

        [
            USER_ID,
            topic,
            subject,
            description,
            study_date,
            duration_minutes
        ]

    );

    res.redirect("/sessions");

});



router.post("/sessions/edit/:id", async (req, res) => {

    const {
        topic,
        subject,
        description,
        study_date,
        duration_minutes
    } = req.body;

    await db.query(

        `UPDATE study_sessions

         SET topic=?,
             subject=?,
             description=?,
             study_date=?,
             duration_minutes=?

         WHERE session_id=?`,

        [
            topic,
            subject,
            description,
            study_date,
            duration_minutes,
            req.params.id
        ]

    );

    res.redirect("/sessions");

});



router.post("/sessions/delete/:id", async (req, res) => {

    await db.query(

        `DELETE FROM study_sessions
         WHERE session_id=?`,

        [req.params.id]

    );

    res.redirect("/sessions");

});



router.post("/sessions/complete/:id", async (req, res) => {

    await db.query(

        `UPDATE study_sessions

         SET completed = TRUE

         WHERE session_id=?`,

        [req.params.id]

    );

    res.redirect("/sessions");

});



router.get("/sessions/search", async (req, res) => {

    const keyword = req.query.q || "";

    const [sessions] = await db.query(

        `SELECT *

         FROM study_sessions

         WHERE user_id = ?

         AND (

            topic LIKE ?

            OR subject LIKE ?

            OR description LIKE ?

         )`,

        [

            USER_ID,

            `%${keyword}%`,
            `%${keyword}%`,
            `%${keyword}%`

        ]

    );

    res.render("sessions", {
        sessions
    });

});

module.exports = router;