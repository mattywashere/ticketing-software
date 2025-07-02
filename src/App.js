import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Main App component
const App = () => {
  // State variables for Firebase, user, tickets, and form inputs
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDescription, setNewTicketDescription] = '';
  const [newTicketStatus, setNewTicketStatus] = useState('Open');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = '';
  const [ticketToEdit, setTicketToEdit] = useState(null);
  const [editTicketTitle, setEditTicketTitle] = useState('');
  const [editTicketDescription, setEditTicketDescription] = '';
  const [editTicketStatus, setEditTicketStatus] = '';

  // --- YOUR ACTUAL FIREBASE CONFIGURATION ---
  // This has been replaced with the values from your screenshot.
  const firebaseConfig = {
    apiKey: "AIzaSyB31G4bV6U27M7K37bM6X7k37Y7n7H3", // Replaced with your apiKey
    authDomain: "ticketing-software-dcdde.firebaseapp.com", // Replaced with your authDomain
    projectId: "ticketing-software-dcdde", // Replaced with your projectId
    storageBucket: "ticketing-software-dcdde.appspot.com", // Replaced with your storageBucket
    messagingSenderId: "793788949793", // Replaced with your messagingSenderId
    appId: "1:793788949793:web:7623c120c816d57fce8d", // Replaced with your appId
    measurementId: "G-920S2YJ26X" // Replaced with your measurementId
  };
  // --- END YOUR ACTUAL FIREBASE CONFIGURATION ---

  // Initialize Firebase and set up authentication
  useEffect(() => {
    try {
      // Initialize Firebase app
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      // Sign in anonymously for local development/deployment
      const signIn = async () => {
        try {
          await signInAnonymously(firebaseAuth);
        } catch (error) {
          console.error("Firebase authentication error:", error);
          showUserMessage(`Authentication failed: ${error.message}`);
        }
      };

      signIn();

      // Listen for authentication state changes
      const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          setUserId(null);
        }
        setLoading(false); // Set loading to false once auth state is determined
      });

      // Cleanup function
      return () => unsubscribeAuth();
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      showUserMessage(`Error initializing app: ${error.message}`);
      setLoading(false);
    }
  }, []);

  // Fetch tickets from Firestore when db or userId changes
  useEffect(() => {
    if (db && userId) {
      // Construct the collection path for public data
      const currentAppId = firebaseConfig.projectId;
      const ticketsCollectionRef = collection(db, `artifacts/${currentAppId}/public/data/tickets`);
      const q = query(ticketsCollectionRef);

      // Listen for real-time updates to the tickets collection
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTickets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort tickets by creation date in memory
        fetchedTickets.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
        setTickets(fetchedTickets);
      }, (error) => {
        console.error("Error fetching tickets:", error);
        showUserMessage(`Error fetching tickets: ${error.message}`);
      });

      // Cleanup function
      return () => unsubscribe();
    }
  }, [db, userId, firebaseConfig.projectId]);

  // Function to show a user message in a modal
  const showUserMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  // Handle ticket creation
  const handleCreateTicket = async () => {
    if (!newTicketTitle.trim() || !newTicketDescription.trim()) {
      showUserMessage("Please fill in both title and description for the ticket.");
      return;
    }

    if (!db || !userId) {
      showUserMessage("App not ready. Please wait for authentication.");
      return;
    }

    try {
      const currentAppId = firebaseConfig.projectId;
      await addDoc(collection(db, `artifacts/${currentAppId}/public/data/tickets`), {
        title: newTicketTitle,
        description: newTicketDescription,
        status: newTicketStatus,
        createdAt: new Date(),
        createdBy: userId,
      });
      setNewTicketTitle('');
      setNewTicketDescription('');
      setNewTicketStatus('Open');
      showUserMessage("Ticket created successfully!");
    } catch (e) {
      console.error("Error adding document: ", e);
      showUserMessage(`Error creating ticket: ${e.message}`);
    }
  };

  // Handle opening the edit modal
  const handleEditClick = (ticket) => {
    setTicketToEdit(ticket);
    setEditTicketTitle(ticket.title);
    setEditTicketDescription(ticket.description);
    setEditTicketStatus(ticket.status);
    setShowModal(true);
    setModalMessage("Edit Ticket");
  };

  // Handle updating a ticket
  const handleUpdateTicket = async () => {
    if (!ticketToEdit || !editTicketTitle.trim() || !editTicketDescription.trim()) {
      showUserMessage("Please fill in all fields for the ticket.");
      return;
    }

    if (!db) {
      showUserMessage("App not ready. Please wait for authentication.");
      return;
    }

    try {
      const currentAppId = firebaseConfig.projectId;
      const ticketDocRef = doc(db, `artifacts/${currentAppId}/public/data/tickets`, ticketToEdit.id);
      await updateDoc(ticketDocRef, {
        title: editTicketTitle,
        description: editTicketDescription,
        status: editTicketStatus,
      });
      showUserMessage("Ticket updated successfully!");
      setTicketToEdit(null);
      closeModal();
    } catch (e) {
      console.error("Error updating document: ", e);
      showUserMessage(`Error updating ticket: ${e.message}`);
    }
  };

  // Handle deleting a ticket
  const handleDeleteTicket = async (ticketId) => {
    if (!db) {
      showUserMessage("App not ready. Please wait for authentication.");
      return;
    }

    // Custom confirmation modal
    showUserMessage(
      <div>
        <p>Are you sure you want to delete this ticket?</p>
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={async () => {
              try {
                const currentAppId = firebaseConfig.projectId;
                await deleteDoc(doc(db, `artifacts/${currentAppId}/public/data/tickets`, ticketId));
                showUserMessage("Ticket deleted successfully!");
                closeModal();
              } catch (e) {
                console.error("Error deleting document: ", e);
                showUserMessage(`Error deleting ticket: ${e.message}`);
                closeModal();
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
      {/* Tailwind CSS CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Inter font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-2">Ticketing Software</h1>
        <p className="text-lg text-gray-600">Manage your support tickets efficiently.</p>
        {userId && (
          <p className="text-sm text-gray-500 mt-2">
            Your User ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded-md">{userId}</span>
          </p>
        )}
      </header>

      {/* Create New Ticket Section */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Create New Ticket</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Ticket Title</label>
            <input
              type="text"
              id="title"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
              placeholder="e.g., Website not loading"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={newTicketStatus}
              onChange={(e) => setNewTicketStatus(e.target.value)}
            >
              <option>Open</option>
              <option>In Progress</option>
              <option>Closed</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={newTicketDescription}
            onChange={(e) => setNewTicketDescription(e.target.value)}
            placeholder="Provide a detailed description of the issue or request."
          ></textarea>
        </div>
        <button
          onClick={handleCreateTicket}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg"
        >
          Create Ticket
        </button>
      </section>

      {/* Ticket List Section */}
      <section className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">All Tickets</h2>
        {tickets.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No tickets found. Create one above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{ticket.title}</h3>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">{ticket.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                      ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}`}
                    >
                      {ticket.status}
                    </span>
                    <span>Created By: {ticket.createdBy.substring(0, 6)}...</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    Created At: {ticket.createdAt?.toDate().toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="flex space-x-3 mt-auto pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditClick(ticket)}
                    className="flex-1 bg-indigo-500 text-white py-2 px-3 rounded-md text-sm hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                    className="flex-1 bg-red-500 text-white py-2 px-3 rounded-md text-sm hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Custom Modal for Messages and Editing */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {ticketToEdit ? "Edit Ticket" : "Message"}
            </h3>
            {ticketToEdit ? (
              // Edit Ticket Form
              <div>
                <div className="mb-4">
                  <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    id="editTitle"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={editTicketTitle}
                    onChange={(e) => setEditTicketTitle(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="editDescription"
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={editTicketDescription}
                    onChange={(e) => setEditTicketDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-6">
                  <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="editStatus"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    value={editTicketStatus}
                    onChange={(e) => setEditTicketStatus(e.target.value)}
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleUpdateTicket}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => { setTicketToEdit(null); closeModal(); }}
                    className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Message Display
              <div>
                <p className="text-gray-700 mb-6">{modalMessage}</p>
                <div className="flex justify-end">
                  {/* Only show close button if it's a simple message, not a confirmation with explicit buttons */}
                  {!modalMessage.includes("Are you sure you want to delete") && (
                    <button
                      onClick={closeModal}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
