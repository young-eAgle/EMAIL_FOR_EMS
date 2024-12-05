import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Define allowed origins dynamically
      const allowedOrigins = ['http://95.217.67.77:7003', 'http://bimserver:7003','http://192.168.43.145:8080','http://localhost:8080'];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);  // Origin is allowed
      } else {
        callback(new Error('Not allowed by CORS'));  // Reject other origins
      }
    }
  }));
  



// GET route to test server
app.get('/', (req, res) => {
    res.send('NodeMailer server is running!');
});

// Proxy route to fetch the report (to bypass CORS issues)
app.post('/fetch-report', async (req, res) => {
    const { reportUrl } = req.body;

    try {
        const reportResponse = await fetch(reportUrl);
        if (!reportResponse.ok) {
            throw new Error('Failed to fetch report: ' + reportResponse.statusText);
        }
        const reportArrayBuffer = await reportResponse.arrayBuffer();
        // const reportBlob = await reportResponse.buffer();  // Get the response as buffer (for PDF)
        const reportBlob=Buffer.from(reportArrayBuffer);

        // Send the report back to the client
        res.setHeader('Content-Type', 'application/pdf');
        res.send(reportBlob);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Email sending function
app.post('/send-email', (req, res) => {
    const { to, subject, text, attachment } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'asadqhseinternational@gmail.com',
            pass: 'paanaceidwrztixf'  // Make sure to keep this secure
        }
    });

    let mailOptions = {
        from: 'asadqhseinternational@gmail.com',
        to: to,
        subject: subject,
        text: text,
        attachments: attachment ? [{
            filename: attachment.filename,
            content: attachment.content,
            encoding: 'base64'
        }] : []
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ error: error.toString() });
        }
        res.json({ message: 'Email sent successfully', response: info.response });
    });
});

// Start the server
const PORT = 3005;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
