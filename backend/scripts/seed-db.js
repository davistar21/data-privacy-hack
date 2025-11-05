// scripts/seed-db.js
import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.resolve("db/app.sqlite"));

const orgs = [
  { id: "1", name: "Zenith Bank", description: "A leading financial institution offering banking and investment services." },
  { id: "2", name: "Lagos Hospital", description: "A major healthcare provider specializing in general medicine and surgery." },
  { id: "3", name: "EcomShop", description: "An online retail company providing a wide range of consumer products." },
  { id: "4", name: "MobileTel", description: "A telecommunications company offering mobile and internet services." },
  { id: "5", name: "UniTech", description: "An educational institution focused on technology and innovation." },
];


const insertOrg = db.prepare("INSERT INTO organizations (id, name, description) VALUES (?, ?, ?)");
const insertUser = db.prepare("INSERT INTO users (id, name, phone, nin) VALUES (?, ?, ?, ?)");

// insert orgs
orgs.forEach(org => insertOrg.run(org.id, org.name, org.description));


// get org ids
// const orgRows = db.prepare("SELECT * FROM organizations").all();

const users = [
  { id: "1", name: "John Doe", phone: "08031234567", nin: "12345678901" },
  { id: "2", name: "Jane Smith", phone: "08039876543", nin: "23456789012" },
  { id: "3", name: "Michael Lee", phone: "08123456789", nin: "34567890123" },
  { id: "4", name: "Amaka Obi", phone: "07011223344", nin: "45678901234" },
];


users.forEach(u => {
  insertUser.run(u.id, u.name, u.phone, u.nin);
});



db.close();
console.log("Database seeded successfully.");