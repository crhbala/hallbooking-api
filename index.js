const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8000;

app.use(bodyParser.json());

// Sample data
let rooms = [
  { id: 1, name: 'Room A', seats: 50, amenities: ['Projector', 'Whiteboard'], pricePerHour: 50 },
  { id: 2, name: 'Room B', seats: 30, amenities: ['TV', 'Conference Phone'], pricePerHour: 40 },
];

let bookings = [];
let customers = [];

// Create a room
app.post('/rooms', (req, res) => {
  const { name, seats, amenities, pricePerHour } = req.body;
  const newRoom = { id: rooms.length + 1, name, seats, amenities, pricePerHour };
  rooms.push(newRoom);
  res.json(newRoom);
});

// Book a room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  // Check if the room is available
  const isRoomAvailable = bookings.every(booking => {
    return !(booking.roomId === roomId &&
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime)));
  });

  if (!isRoomAvailable) {
    return res.status(400).json({ error: 'Room already booked for the given date and time.' });
  }

  const newBooking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
    bookingDate: new Date(),
    bookingStatus: 'Booked',
  };

  bookings.push(newBooking);
  customers.push({ ...newBooking, roomName: rooms.find(room => room.id === roomId)});

  res.json(newBooking);
});

// List all rooms with booked date
app.get('/rooms', (req, res) => {
  const roomList = rooms.map(room => {
    const bookedRoom = bookings.find(booking => booking.roomId === room.id);
    return {
      name: room.name,
      bookedStatus: bookedRoom ? 'Booked' : 'Available',
      customerName: bookedRoom ? bookedRoom.customerName : null,
      date: bookedRoom ? bookedRoom.date : null,
      startTime: bookedRoom ? bookedRoom.startTime : null,
      endTime: bookedRoom ? bookedRoom.endTime : null,
    };
  });
  res.json(roomList);
});

// List all customers with booked date
app.get('/customers', (req, res) => {
  res.json(customers);
});

// List customer booking details
app.get('/customer/bookings/:customerName', (req, res) => {
  const customerName = req.params.customerName;
  const customerBookings = customers.filter(customer => customer.customerName === customerName);
  res.json(customerBookings);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
