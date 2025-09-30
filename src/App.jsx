import { useState, useEffect } from 'react'
import Footer from './components/Footer'
import Note from "./components/Note"
import noteService from './services/notes'
import './index.css'
import loginService from './services/login'


const App = () => {
  const [notes, setNotes] = useState(null)
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  if (!notes) {
    return null
  }
  
  const toggleImportanceOf = (id) => {
    const url = `http://localhost:3001/notes/${id}`
    const note = notes.find (n => n.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote).then(returnedNote => {
        setNotes(notes.map(note => note.id === id ? returnedNote : note))
      })
      .catch(error => {
        setErrorMessage(
          `Note '${note.content}' was already removed from server` 
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter (n => n.id !==id))
      })
  }

  const addNote = (event) => {
    event.preventDefault()
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    }
    
    if (newNote.length <5 ) {
      setErrorMessage('Note must be 5 characters or more')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    } else {
      noteService
        .create(noteObject)
        .then(returnedNote => {
          setNotes(notes.concat(returnedNote))
          setNewNote('')
        })
    }
    
    
  }

  const handleNoteChange = (event) => {
    console.log(event.target.value)
    setNewNote(event.target.value)
  }

  const notesToShow = showAll
    ? notes
    : notes.filter (note => note.important)

  const Notification = ({ message }) => {
    if(message === null) {
      return null
    }

    return (
      <div className='error'>
        {message}
      </div>
    )
  }

  const handleLogin = async event => {
    event.preventDefault()
    
    try {
      const user = await loginService.login({ username, password })

      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input 
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input 
              type="password"
              value={password}
              onChange={({target}) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
  )

  const noteForm = () => (
    <form onSubmit={addNote}>
        <input value={newNote} onChange={handleNoteChange}/>
        <button type="submit">save</button>
      </form>
  )

  const logOutHandler = () => {
    window.localStorage.removeItem('loggedNoteappUser')
    window.location.reload()
  }

  return (
    <div>
      <h1>Notes</h1>
      <Notification message = {errorMessage} />

     {!user && loginForm()}
     {user && (
      <div>
        <p>{user.name} logged in</p>
        {noteForm()}
        <button onClick={logOutHandler}>Log out</button>
      </div>
     )}
     
      

      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important': 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note =>
            <Note key={note.id} note={note} toggleImportance={() => toggleImportanceOf(note.id)}/>
        )}
      </ul>
      
      <Footer />
    </div>
  )
}

export default App

