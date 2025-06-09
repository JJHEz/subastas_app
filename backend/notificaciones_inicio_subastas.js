require('dotenv').config({ path: './backend/.env' });
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function obtenerHoraBolivia() {
  const fechaUTC = new Date();
  const fechaBolivia = new Date(fechaUTC.toLocaleString("en-US", { timeZone: "America/La_Paz" }));
  return fechaBolivia;
}

async function enviarCorreos() {
  const ahora = obtenerHoraBolivia();
  const horaActual = ahora.getHours();
  const minutosActuales = ahora.getMinutes();

  const fechaHoy = ahora
    .toLocaleDateString("es-ES")
    .split("/")
    .map((v, i) => (i === 2 ? v : v.padStart(2, "0")))
    .join("-");
  console.log(` Fecha de hoy: ${fechaHoy}`);

  const martilleroSnapshot = await db
    .collection("martillero")
    .where("fecha_ini", "==", fechaHoy)
    .get();

  if (martilleroSnapshot.empty) {
    console.log("No hay subastas (martilleros) para hoy");
    return;
  }

  for (const doc of martilleroSnapshot.docs) {
    const martillero = doc.data();

    const horaIni = martillero.hora_ini; 
    const [hora, minutos] = horaIni.split(":").map(Number);
    const idMar = doc.id;
    const diffHoras = hora - horaActual;
    const diffMinutos = minutos - minutosActuales;

    // Calculamos minutos faltantes reales
    const minutosFaltantes = diffHoras * 60 + diffMinutos;

    console.log(`Minutos faltantes para subasta a las ${horaIni}: ${minutosFaltantes}`);

    if (minutosFaltantes == 10) {
      console.log(`Enviando correos para subasta que inicia a las ${horaIni}`);

      const participantes = martillero.participantes || [];

      for (const idUsuario of participantes) {
        const usuarioDoc = await db
          .collection("usuario")
          .doc(String(idUsuario))
          .get();
        const usuario = usuarioDoc.data();
        
        if (!usuario || !usuario.correo_electronico) {
          console.log(
            `Usuario con ID ${idUsuario} no tiene correo o no existe`,
          );
          continue;
        }

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: usuario.correo_electronico,
          subject: "Recordatorio: Subasta próxima",
          html: `
            <p>Hola <b>${usuario.nombre}</b>,</p>
            <p>Tu subasta de la SALA ${idMar} comenzará en 10 minutos, a las ${horaIni}.</p>
            <p>¡Prepárate para participar!</p>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Correo enviado a ${usuario.nombre}`);
          await new Promise((res) => setTimeout(res, 1000)); // delay opcional
        } catch (error) {
          console.error(
            `Error enviando correo a ${usuario.nombre}:`,
            error.message,
          );
        }
      }
    }
  }
}

cron.schedule("* * * * *", () => {
  console.log("Revisión periodica para envío de correos...");
  enviarCorreos().catch(console.error);
});
