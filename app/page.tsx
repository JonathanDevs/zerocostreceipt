import Hello from "./hello"
import Jonless from "./Jonless"

const HomePage = () => {
  console.log("What type of a component am I?");
  return (
    <main>
      <h1>Hello Next.js!</h1>
      <Hello />
      <Jonless />
    </main>
  )
}

export default HomePage