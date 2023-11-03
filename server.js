const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// WebSocket server
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
        console.log('Received message:', message);

        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

// RESTful API server
app.use(express.json());

// In-memory storage for resources (for demonstration purposes)
const resources = [];

// Create a resource
app.post('/api/resources', (req, res) => {
    const resource = req.body;
    resources.push(resource);
    res.status(201).json(resource);
});

// Read all resources
app.get('/api/resources', (req, res) => {
    res.json(resources);
});

// Delete a resource by index
app.delete('/api/resources/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < resources.length) {
        resources.splice(index, 1);
        res.status(204).end();
    } else {
        res.status(404).json({ error: 'Resource not found' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});