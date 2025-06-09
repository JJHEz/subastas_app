const cors = require('cors');
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: { rejectUnauthorized: false }
});
app.use(cors({
  origin: 'http://localhost:8081', // La URL de tu frontend
}));
app.post('/send-payment-email', async (req, res) => {
  const { email, nombre } = req.body;

  if (!email || !nombre) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Pago recibido ',
    html: `<p>Hola <b>${nombre}</b>,</p><p>Gracias por tu pago. ¡Tu participación en la subasta está confirmada!</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ message: 'Correo enviado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error enviando correo' });
  }
});

app.listen(8082, () => console.log('Servidor backend escuchando en puerto 8082'));
