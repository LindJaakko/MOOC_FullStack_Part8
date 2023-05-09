import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import Select from 'react-select'

const AuthorForm = ({ authors, setError }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      const errors = error.graphQLErrors[0].extensions.error.errors
      const messages = Object.values(errors)
        .map((e) => e.message)
        .join('\n')
      setError(messages)
    },
  })

  const submit = async (event) => {
    event.preventDefault()
    editAuthor({ variables: { name, born } })
    setName('')
    setBorn('')
  }

  const authorOptions = authors.map((a) => ({
    value: a.name,
    label: a.name,
  }))

  const handleChange = (event) => {
    setName(event.value)
  }

  return (
    <div>
      <h2>set birthyear</h2>
      <form onSubmit={submit}>
        <Select
          onChange={handleChange}
          name='authors'
          id='author-select'
          options={authorOptions}
        />
        <div>
          born
          <input
            type='number'
            value={born}
            onChange={({ target }) => setBorn(parseInt(target.value))}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default AuthorForm
