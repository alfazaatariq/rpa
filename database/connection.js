import mysql from "mysql2";

/**
 * Connects to a database using the provided host, user, password, and database name.
 *
 * @param {string} host - The host of the database. Default is "127.0.0.1".
 * @param {string} user - The username for the database. Default is "root".
 * @param {string} password - The password for the database. Default is an empty string.
 * @param {string} database - The name of the database you want to connect to.
 */

const connectToDB = (
  host = "127.0.0.1",
  user = "root",
  password = "",
  database
) => {
  try {
    const db = mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: database,
    });

    console.log("CONNECTING TO DB...");

    db.connect((err) => {
      if (err) throw err;
      console.log("CONNECTION ESTABLISHED!");

      if (database) {
        console.log("CONNECTED TO DB: " + database);
      }
    });

    return db;
  } catch (err) {
    console.error("ERROR CONNECTING: " + err.message);
    throw err;
  }
};

export default connectToDB;
