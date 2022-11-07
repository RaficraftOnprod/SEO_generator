import { useEffect, useRef, useState, createRef } from "react";
import S from './Breadcrumb.module.scss';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { debounce } from '../../src/utils/debounce';

type URLTypes = {
  https: boolean,
  www: boolean,
  path: string,
  decompose: string[],
  name: string[]
}

export default function BreadCrumb(): JSX.Element {

  const [URL, setURL] = useState<URLTypes>({
    https: false,
    www: false,
    path: '',
    decompose: [],
    name:[]
  });
  const [breadcrumbJson, setBreadcrumbJson] = useState('Type your url on the input');

  const regexURL = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

  const inputURL = useRef(null)
  const [inputs, setInputs] = useState<JSX.Element[]>([])
  let inputRef = useRef<any>([]);
  function checkURL() {

    if (inputURL.current) {
      const input: HTMLInputElement = inputURL.current;
      const path = input.value;

      if (regexURL.test(path)) {
        setBreadcrumbJson('URL valide')

        const decomposeURL = path
          .replace(/http:\/\//, '')
          .replace(/https:\/\//, '')
          .replace('www.', '')
          .split('/')
          .map(el => {
            const clean = el.split('?');
            return clean[0]
          });
        setURL({
          https: path.includes('https'),
          www: path.includes('www'),
          path: path,
          decompose: decomposeURL,
          name: decomposeURL,
        })


      } else {
        setBreadcrumbJson('URL invalide')
        setURL({
          https: false,
          www: false,
          path: '',
          decompose: [],
          name:[],
        })
      }
    }
  }

  function editName(idx: number) {

    console.log(inputRef.current[idx].value)
    setURL((state) => {
      return {
        ...state,
        name : {...state.name, [idx] : inputRef.current[idx].value}
      }
    })
  }

  function dynamicOption() {
    const dynamic = URL.decompose.map((el: string, idx: number) => {
      return (
        <div className={`bloc_input bloc_input__col`} key={`dynamic-input${idx}`}>
          <label>Name {idx}:</label>
          <input
            type="text"
            defaultValue={el}
            onKeyUp={debounce(() => { editName(idx) }, 300)}
            ref={(elem) => inputRef.current[idx] = elem} />
        </div>
      )
    });
    setInputs(dynamic)
  }

  function makeJsonLD() {
    
const res = 
`<script type="application/ld+json">
  [{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": ${JSON.stringify(itemListElement(), null, 4)}
  }]
</script>`
    return res;
  }

  function itemListElement() {

    const res = URL.decompose.map((el, idx) => {  
      
      if (idx < URL.decompose.length - 1) {
        return {
        "@type": "ListItem",
        "position": idx + 1,
        "name": URL.name[idx],
        "item": rebuildURL(idx),
       }        
      } else {
        return {
        "@type": "ListItem",
        "position": idx + 1,
        "name": URL.name[idx]
       }
      }
      
    })

    return res;
  }

    function rebuildURL(idx: number) {
    let res = ''
    res += URL.https ? 'https://' : 'http://';
    res += URL.www ? 'www.' : '';

    const dynamic = URL.decompose.map((url, key) => {
      if (key <= idx) {
        return url + '/';
      } else { return null }
    }).join('')

    res += dynamic


    return res;
  }


  useEffect(() => {
    if (URL.path) {     
      dynamicOption();
    }
  }, [URL])


  useEffect(() => {
     if (URL.path) {          
      setBreadcrumbJson(makeJsonLD());
    }
  }, [URL])
  
  useEffect(() => {
     console.log('work data', URL.name )
  },[URL])


  return (
    <section className={`main_content ${S.container}`}>
      <header>

        <div className={`bloc_input`}>
          <input
            placeholder="Type your URL"
            onKeyUp={debounce(() => { checkURL() }, 300)}
            ref={inputURL}
            defaultValue=""
          />
        </div>

      </header>

      <div className={S.content}>
        <div className={S.seo_result}>
          <SyntaxHighlighter
            language="javascript"
            style={atomDark}
          >
            {`${breadcrumbJson}`}
          </SyntaxHighlighter>
        </div>

        {URL.path ?
          (<details>
            <summary>Options</summary>
            <div className="full_width">
              {inputs}
            </div>
          </details>)
          : null
        }

      </div>

    </section>
  )
}

