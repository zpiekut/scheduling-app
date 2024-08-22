const express = require("express");
const mysql = require("mysql2");
const app = express();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "password",
  database: process.env.MYSQL_DATABASE || "test",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

app.use(express.json())

app.get("/clients", (req, res) => {
  pool.query('SELECT * FROM clients', (err, rows, fields) => {
    if (err) {
      res.json({
        success: false,
        err,
      });
    } else {
      res.json({
        success: true,
        rows,
      });
    }
  });
});

app.get("/providers", (req, res) => {
  pool.query('SELECT * FROM providers', (err, rows, fields) => {
    if (err) {
      res.json({
        success: false,
        err,
      });
    } else {
      res.json({
        success: true,
        rows,
      });
    }
  });
});

app.post("/schedule", (req, res) => {
  provider_id = req.body.provider_id;
  timeslots = req.body.timeslots;

  query = "INSERT INTO provider_schedule (provider_id, timeslot) VALUES "
  timeslots.forEach((timeslot) => 
    query += `(${provider_id}, '${timeslot}'),`
  );
  query = query.substring(0, query.length - 1);

  pool.query(query, (err, rows) => {
    if (err) {
      res.json({
        success: false,
        err,
      });
    } else {
      res.json({
        success: true,
        rows,
      });
    }
  });
});

app.get("/schedule/available", (req, res) => {
  query = `
    SELECT s.id,s.timeslot,s.provider_id
    FROM provider_schedule as s
    LEFT JOIN appointments as a ON a.schedule_id=s.id
    WHERE 
      (
        a.id is Null
        OR (
          a.is_confirmed=0
          AND a.created < DATE_SUB(NOW(),INTERVAL 30 MINUTE)
        )
        )
        AND s.timeslot >= (NOW() + INTERVAL 1 DAY);
  `
  pool.query(query, (err, rows) => {
    if (err) {
      res.json({
        success: false,
        err,
      });
    } else {
      res.json({
        success: true,
        rows,
      });
    }
  });
});

app.post("/appointment", (req, res) => {
  schedule_id = req.body.schedule_id;
  client_id = req.body.client_id;

  select_q = `SELECT * FROM provider_schedule 
    WHERE id=${schedule_id}
    AND timeslot >= (NOW() + INTERVAL 1 DAY);`;
  insert_q = `INSERT INTO appointments (schedule_id, client_id, is_confirmed) 
    VALUES (${schedule_id}, ${client_id}, 0)`;
  
  pool.query(select_q, (err, rows) => {
    if (err) {
      res.json({
        success: false,
        err,
      });
    } 
    else if (!rows || !rows.length) {
      res.json({
        success: false,
        message: "appointments must be booked more than 24 hours in advance",
      });
    }
    else {
      pool.query(insert_q, (err, rows) => {
        if (err) {
          res.json({
            success: false,
            err,
          });
        } else {
          res.json({
            success: true,
            rows,
          });
        }
      });
    }
  });
});

app.post("/appointment/confirm", (req, res) => {
  appointment_id = req.body.appointment_id;
  
  select_q = `SELECT * FROM appointments
    WHERE id=${appointment_id}
    AND created > DATE_SUB(NOW(),INTERVAL 30 MINUTE);`;
  update_q = `UPDATE appointments SET is_confirmed = 1 WHERE id = ${appointment_id};`;
  
  pool.query(select_q, (err, rows) => {
    if (err) {
      res.json({
        success: false,
        err,
      });
    } 
    else if (!rows || !rows.length) {
      res.json({
        success: false,
        message: "appointments must be confirmed within 30 mins of booking",
      });
    }
    else {
      pool.query(update_q, (err, rows) => {
        if (err) {
          res.json({
            success: false,
            err,
          });
        } else {
          res.json({
            success: true,
            rows,
          });
        }
      });
    }
  });
});

app.listen(8000, () => console.log("listining on port 8000"));