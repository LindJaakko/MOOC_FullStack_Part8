import { useQuery } from '@apollo/client'
import { ALL_BOOKS, CURRENT_USER } from '../queries'

const Books = (props) => {
  const currentUserResult = useQuery(CURRENT_USER)

  const bookResult = useQuery(ALL_BOOKS, {
    variables: {
      genre: currentUserResult.loading
        ? null
        : currentUserResult.data.me.favoriteGenre,
    },
  })

  if (bookResult.loading || currentUserResult.loading) {
    return <div>loading...</div>
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>recommendations</h2>
      <div>
        books in your favorite genre
        <b> {currentUserResult.data.me.favoriteGenre}</b>
      </div>
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
    </div>
  )
}

export default Books
