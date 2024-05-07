import '../styles/guide.css';
import Typography from "@mui/joy/Typography";
import Textarea from "@mui/joy/Textarea";
import {process_string} from '../wasm/lala_lib';
import * as val from '../validation.js';
import {useState} from "react";
import {ErrorBar} from "./ErrorBar.jsx";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import Stack from "@mui/joy/Stack";

export const Guide = () => {
  const [popUp, setPopUp] = useState('');
  const [output, setOutput] = useState('');
  const [open, setOpen] = useState(false);

  const ResultModal = ({output, open}) => {
    return (
      <Modal
        open={open}
        aria-labelledby={'output-modal'}
        onClose={(_event, _reason) => {
          setOpen(false)
        }}
      >
        <ModalDialog
          size={'md'}
          sx={{
            color: 'white',
            backgroundColor: 'black',
            borderColor: 'black'
          }}
        >
          <DialogTitle>Lala Result</DialogTitle>
          <br/>
          <div>
            {output.split('\n').map((row, idx) => {
              return (
                <div key={idx}>
                  {row}
                </div>
              )
            })}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
          >
            <Stack spacing={2}>
              <button
                type="submit"
                aria-label='close'
                className={'hoverbtn'}
                style={{height: '2.5rem'}}
              >
                Close
              </button>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    )
  }
  const DefaultTypography = ({children, marginTop='1rem'}) => {
    return <Typography sx={{color: 'white', marginLeft: '2rem', marginTop}} level={'body-lg'}>{children}</Typography>;
  }

  const runLala = (e) => {
    e.preventDefault();
    let input = document.getElementById('lala-input')?.value;
    try {
      input = val.checkString(input, 'file content');
    } catch(err) {
      setPopUp(err);
      return;
    }
    setPopUp('');
    try {
      const interpreted = process_string(input);
      setOutput(interpreted);
      setOpen(true);
    } catch(_){
      alert(`Something went wrong with the interpreter. Please double check your input. If the issue persists and you are sure you aren't doing anything wrong, try again later.`);
    }
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      runLala(e);
    }
  }

  const defInput = `
  fun myFunction = (a b) => {
    let c = a @ b    // dot product
    let d = % c    // transpose
    let e = (? d) ** (2 1 3 ; 9 1 4 ; 8 1 7)    // inverse and elem-wise multiplication
    e
  }
  
  /* 
  wrapper is going to return the function myFunction
  */  
  fun wrapper = () => {
    myFunction
  }
  
  let m = 1 0 0 ; 0 1 0 ; 0 0 1
  let n = 1 2 3 ; 4 5 6 ; 7 8 10
  
  let anon = wrapper()
  let z = anon(m n)
  z
`;

  return (
    <>
      <Typography sx={{color: 'white'}} style={{marginTop: '8rem'}} level={'h1'}>
        A Guide to Lala
      </Typography>
      <div className="row" position={'relative'}>
        <div className="half">
          <DefaultTypography>
            Lala is a programming language specializing in matrix operations.
            The language comes with some common operations built in, such as finding
            the dot product of two matrices, the inverse of a matrix, and the determinant,
            just to name a few. You can also create new functions for your own use.
            <br/>
            Feel free to try anything in the editor to your right --&gt;
          </DefaultTypography>
          <DefaultTypography>
            Starting with the basics, how do we define a matrix variable? Its quite simple:
            <br/>
            let a = 1 0 0 ; 0 1 0 ; 0 0 1
            <br/>
            Even if you reassign a variable, you still must use the `let` keyword.
          </DefaultTypography>
          <DefaultTypography>
            That defined a variable `a` that is set to a 3x3 identity matrix. All matrices are
            defined this way. Matrix elements can be positive or negative integers or decimals.
            For higher dimensional matrices, defining them on one line may not be ideal,
            so you can also define them with the rows on separate lines:
            <br/>
            let b = 1 2 3 ;
            <br/>
            4 5 6 ;
            <br/>
            7 8 9
          </DefaultTypography>
          <DefaultTypography>
            To print a variable (this only works in the top level, not inside functions)
            just place the identifier on a line on its own. The value will only get printed if there are no
            more expressions after the print.
            So if I wanted to print b, my line would simply be:
            <br/>
            b
            <br/>
            Note that this is not the case for a notebook cell, where if the last line in a cell is a variable assignment,
            the value of the variable will also be printed. I thought that was a cool feature.
          </DefaultTypography>
          <DefaultTypography>
            Lala has two kinds of operators: Dyadic and monadic operators. Dyadic operators are infix operators (they are
            placed between two variables) while monadic operators are prefix operators (they are placed before a single
            variable).
          </DefaultTypography>
          <DefaultTypography>
            The following dyadic operators are available:
            <br/>
            Dot product: a @ b
            <br/>
            Matrix addition: a ++ b
            <br/>
            Element-wise matrix multiplication: a ** b
          </DefaultTypography>
          <DefaultTypography>
            The follow monadic operators are available:
            <br/>
            Matrix rank: # a
            <br/>
            Row-Reduced Echelon Form: rref a
            <br/>
            Transpose: % a
            <br/>
            Determinant: det a
          </DefaultTypography>
          <DefaultTypography>
            Functions are cool. In Lala, functions are first class variables, meaning you can treat them as regular
            variables (like in Javascript, Python, and OCaml). You can pass the function identifiers arguments to
            other functions, and can even return function identifiers from other functions, bind them to a new identifier,
            and then use that new identifier to call the function.
            See the text editor on your right for an example on how functions are defined with the `fun` keyword and
            arrow syntax (which you may be familiar with).
            <br/>
            Notice the syntactical similarities to Javascript and OCaml. This was intended and is because these
            languages are awesome.
            <br/>
            The only unique thing about Lala functions is that to return a value you just end the function with
            the identifier. Return statements MUST be identifiers.
          </DefaultTypography>
          <DefaultTypography>
            Comments work exactly like most other C-based languages. Multiline comments are enclosed with /*[content]*/,
            and single-line comments start with //.
          </DefaultTypography>
          <DefaultTypography>
            Rather than pressing the Run button while editing a document or even a cell in a notebook, you can simply
            press Ctrl+Enter. On Mac it might be Command+Enter, but I'm not sure and have no way of testing.
          </DefaultTypography>
          <DefaultTypography>
            You are now ready to begin using Lala! Should anything go wrong, please come back and consult these docs
            as they contain everything you need!
          </DefaultTypography>

        </div>
        <div
          className="half"
          style={{
            height: '40rem',
            position: 'sticky',
            marginLeft: '1rem',
            marginRight: '1rem',
            top: '8rem'
          }}
        >
          <Textarea
            onKeyDown={handleKeyDown}
            style={{height: '100%', backgroundColor: 'black', color: 'white'}}
            sx={{
              '--Textarea-focusedInset': 'var(--any, )',
              '--Textarea-focusedThickness': '0.2rem',
              '--Textarea-focusedHighlight': 'rgba(13,110,253,.25)',
              '&::before': {
                transition: 'box-shadow .15s ease-in-out',
              },
              '&:focus-within': {
                borderColor: '#86b7fe',
              },
            }}
            defaultValue={defInput}
            slotProps={{textarea: {id: 'lala-input', autoFocus: true}}}
          />
          <button style={{marginTop: '1rem'}} onClick={runLala}>Try it!</button>
        </div>
      </div>
      {
        popUp && <ErrorBar message={popUp}/>
      }
      {
        output && <ResultModal output={output} open={open}/>
      }
    </>
  )
}