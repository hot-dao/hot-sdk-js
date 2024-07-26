import { FC } from "react";
import { ExampleTON } from "./ExampleTON";
import { ExampleSolana } from "./ExambleSolana";
import { ExampleEVM } from "./ExampleEVM";

const App: FC = () => {
  return (
    <div>
      <ExampleTON />
      <ExampleSolana />
      <ExampleEVM />
    </div>
  );
};

export default App;
