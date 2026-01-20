import { useState } from 'react'
import FloatingChatbox from './Chatbox'
import './App.css'

function App() {
  return (
    <div className="app-container">
    {/* //   <header className="app-header">
    //     <h1>Welcome to Padhyasoft</h1>
    //     <p>This page demonstrates the Floating Chatbox component.</p>
    //     <p>Interact with the icon in the bottom-right corner.</p>
    //   </header> */}
      
      {/* Floating Chatbox Component */}
      <FloatingChatbox />
    </div>
  )
}

export default App
