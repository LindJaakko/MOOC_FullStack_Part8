import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES } from '../queries'
import { useState } from 'react'

const Books = (props) => {
  const [genre, setGenre] = useState('')

  const bookResult = useQuery(ALL_BOOKS, {
    variables: { genre },
  })

  const genreResult = useQuery(ALL_GENRES)

  if (bookResult.loading) {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>
      {genre === '' ? (
        <div>all genres</div>
      ) : (
        <div>
          in genre <b>{genre}</b>
        </div>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {bookResult.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genreResult.data.allGenres.map((g) => (
          <button key={g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenre('')}> all genres</button>
      </div>
    </div>
  )
}

export default Books
