import { push, ref, getDatabase } from 'firebase/database'
import { RoomCode } from '../components/RoomCode'
import { Question } from '../components/Question'
import { Button } from '../components/Button'
import { useParams } from 'react-router-dom'
import { FormEvent, useState } from 'react'
import { useRoom } from '../hooks/useRoom'
import { useAuth } from '../hooks/useAuth'
import logoImg from '../assets/images/logo.svg'
import '../styles/question.scss'
import '../styles/room.scss'

type RoomParams = {
    id: string
}

export function Room(){
    const [newQuestion, setNewQuestion] = useState('')
    const params = useParams<RoomParams>()
    const {user} = useAuth()
    const roomId = params.id
    const { title, questions } = useRoom(roomId)
    
    async function handleSendQuestion(event: FormEvent) {
        event.preventDefault()
        if(newQuestion.trim() === ''){
            return
        }

        if(!user){
            throw new Error('You most be logged in')
        }

        const question = {
            content: newQuestion,
            author: {
                name: user.name,
                avatar: user.avatar
            },
            isHighlighted: false,
            isAnswered: false
        }

        const db = getDatabase()
        await push(ref(db, `rooms/${roomId}/questions`), question)
        
        setNewQuestion('')
    }

    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <RoomCode code={params.id}/>
                </div>
            </header>
            <main className="content">
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
                </div>

                <form onSubmit={handleSendQuestion}>
                    <textarea placeholder="O que você quer perguntar"
                    onChange={event => setNewQuestion(event.target.value)}
                    value={newQuestion}/>
                    <div className="form-footer">
                        { user ? (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        ) : (
                            <span>Para enviar uma pergunta, <button>faça seu login</button>.</span>
                        )}
                        
                        <Button type="submit" disabled={!user}>Enviar Pergunta</Button>
                    </div>
                </form>
                
                <div className="question-list">
                    {questions.map(question =>{
                        return(
                            <Question
                                key={question.id}
                                content={question.content}
                                author={question.author}
                            />
                        )
                    })}
                </div>
            </main>
        </div>
    )
}