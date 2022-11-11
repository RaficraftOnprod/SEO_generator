import { useEffect, useRef, useState, createRef } from "react";
import ReactDOMServer from 'react-dom/server';
import S from './Breadcrumb.module.scss';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { debounce } from '../../src/utils/debounce';
import { IconOpenPadlock } from "../../src/assets/svg/icones";

type URLTypes = {
  https: boolean,
  www: boolean,
  path: string,
  decompose: string[],
  name: string[]
}

const BreadcrumbResultMicroData = (structuredData: any, type: string): string | JSX.Element => {
  console.log(structuredData)

  if (type === 'string') {
    return (ReactDOMServer.renderToString(<h1>TOTO</h1>))
  } else {
    return (<h1>TOTO</h1>)
  }
}


console.log('test');

export default function BreadCrumb(): JSX.Element {

  const [URL, setURL] = useState<URLTypes>({
    https: false,
    www: false,
    path: '',
    decompose: [],
    name: []
  });

  const [description, setDescription] = useState<string>('')

  const [format, setFormat] = useState('javascript');
  const [breadcrumbResult, setBreadcrumbResult] = useState<any>({
    jsonLD: 'Type your url on the input',
    javascript: 'Type your url on the input',
    microdata: 'Type your url on the input'
  })

  const regexURL = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

  const inputURL = useRef(null)
  const [inputs, setInputs] = useState<any>(false)
  let inputRef = useRef<any>([]);
  let inputDescription = useRef<any>([])

  function checkURL() {

    if (inputURL.current) {
      const input: HTMLInputElement = inputURL.current;
      const path = input.value;

      if (regexURL.test(path)) {

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
        setURL({
          https: false,
          www: false,
          path: '',
          decompose: [],
          name: [],
        })
      }
    }
  }

  function editName(idx: number) {
    console.log('what')
    setURL((state) => {
      return {
        ...state,
        name: { ...state.name, [idx]: inputRef.current[idx].value }
      }
    })
  }

  function editDescription() {
    setDescription(inputDescription.current.value)
  }

  function dynamicInputs() {

    const dynamic = URL.decompose.map((el: string, idx: number) => {
      if (idx === URL.decompose.length - 1) {
        return (<div key={`nested-input-${idx}`} >
          <div
            className={`bloc_input bloc_input_col`}
            key={`dynamic-input-${idx}`}
          >
            <label>Link {idx}:</label>
            <input
              type="text"
              defaultValue={el.replace('.html', '')}
              onKeyUp={debounce(() => { editName(idx) }, 300)}
              ref={(elem) => inputRef.current[idx] = elem}
            />
          </div>

          <div
            className={`bloc_input bloc_input_col bloc_input_nested`}
            key={`description-${idx}`}
          >
            <label>Link {idx} description:</label>
            <input
              type="text"
              placeholder="Enter a description of the page (optionnal)"
              defaultValue=""
              onKeyUp={debounce(() => { editDescription() }, 300)}
              ref={(elem) => inputDescription.current = elem}
            />
          </div>
        </div>)
      }
      if (idx > 0 && idx < URL.decompose.length - 1) {
        return (
          <div
            className={`bloc_input bloc_input_col`}
            key={`dynamic-input-${idx}`}
          >
            <label>Link {idx}:</label>
            <input
              type="text"
              defaultValue={el.replace('.html', '')}
              onKeyUp={debounce(() => { editName(idx) }, 300)}
              ref={(elem) => inputRef.current[idx] = elem}

            />
          </div>
        )
      } else {
        return []
      }

    });
    setInputs(dynamic)
  }

  function formatJsonLD() {
    if (URL.decompose.length === 0) {
      return 'Type your url on the input'
    }

    const res =
      `<script type="application/ld+json">
  [{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListOrder: 'ItemListOrderAscending',
    "itemListElement": [${JSON.stringify(jsonLDItem(), null, 4)}]
  }]
</script>`
    return res;
  }

  function formatJavascript() {
    if (URL.decompose.length === 0) {
      return 'Type your url on the input'
    }

    const res = `
  const structuredData = 
[{
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListOrder: 'ItemListOrderAscending',
  itemListElement: 
  [{
    ${JSON.stringify(jsonLDItem(), null, '\t').slice(7, -3).trim()}
  }]
}];

<script
  key="structured-data"
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
/>
`
    return String(res.trim());
  }


  function jsonLDItem() {

    let res = []
    let obj: any = {}

    for (let i = 0; i < URL.decompose.length; i++) {
      const element = URL.decompose[i];

      if (i > 0) {

        if (i < URL.decompose.length - 1) {
          obj = {
            "@type": "ListItem",
            "position": i,
            "name": URL.name[i].replace('.html', ''),
            "item": rebuildURL(i),
          }

        } else {
          obj = {
            "@type": "ListItem",
            "position": i,
            "name": URL.name[i].replace('.html', '')
          }

          if (i === URL.decompose.length - 1 && description) {
            obj.description = description
          }
        }

        res.push(obj)
      }
    }
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

    res += dynamic;
    return res;
  }

  useEffect(() => {
    setInputs(false)
    setDescription('')
    setBreadcrumbResult(
      {
        jsonLD: 'Type your url on the input',
        javascript: 'Type your url on the input',
        microdata: 'Type your url on the input'
      }
    )
  }, [URL])

  function oula() {

    return BreadcrumbResultMicroData(URL, 'string');
  }


  useEffect(() => {
    if (URL.path) {
      dynamicInputs();

      switch (format) {
        case 'jsonLD':
          setBreadcrumbResult({
            jsonLD: formatJsonLD(),
            javascript: '',
            microdata: ''
          })
          break;
        case 'javascript':
          setBreadcrumbResult({
            jsonLD: '',
            javascript: formatJavascript(),
            microdata: ''
          })
          break;
        case 'microdata':
          setBreadcrumbResult({
            jsonLD: '',
            javascript: '',
            microdata: oula(),
          })
          break;
      }
    }
  }, [URL, format, description]);

  return (
    <section className={`main_content ${S.container}`}>
      <header>

        <div className={`bloc_input full_width`}>
          <input
            type="text"
            placeholder="Type your URL"
            onKeyUp={debounce(() => {
              checkURL()
            }, 300)}
            ref={inputURL}
            defaultValue=""
          />
        </div>
        {URL.path ? (
          <div className={S.format}>
            <div className={`bloc_input`}>
              <label htmlFor="javascript">Javascript</label>
              <input
                type="radio"
                id="javascript"
                name="format"
                defaultValue="javascript"
                onClick={() => { setFormat('javascript') }}
                checked={format === 'javascript'}
              />
            </div>

            <div className={`bloc_input`}>
              <label htmlFor="jsonLD">JsonLD</label>
              <input
                type="radio"
                id="jsonLD"
                name="format"
                defaultValue="jsonLD"
                onClick={() => { setFormat('jsonLD') }}
                checked={format === 'jsonLD'}
              />
            </div>

            <div className={`bloc_input`}>
              <label htmlFor="microdata">microdata</label>
              <input
                type="radio"
                id="microdata"
                name="format"
                defaultValue="microdata"
                onClick={() => { setFormat('microdata') }}
                checked={format === 'microdata'}
              />
            </div>
          </div>
        ) : null}


      </header>

      <div className={S.content}>
        <div className={S.seo_result}>
          <SyntaxHighlighter
            language="javascript"
            style={atomDark}
            wrapLongLines={true}
          >
            {breadcrumbResult[format]}
          </SyntaxHighlighter>
        </div>

        {URL.path && inputs ?
          (<details open>
            <summary>Name of links</summary>
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


