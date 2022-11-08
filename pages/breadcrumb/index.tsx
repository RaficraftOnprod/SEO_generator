import { useEffect, useRef, useState, createRef } from "react";
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

console.log('test');

export default function BreadCrumb(): JSX.Element {

  const [URL, setURL] = useState<URLTypes>({
    https: false,
    www: false,
    path: '',
    decompose: [],
    name: []
  });

  const [format, setFormat] = useState('javascript');
  const [breadcrumbResult, setBreadcrumbResult] = useState<any>({
    jsonLD: 'Type your url on the input',
    javascript: 'Type your url on the input',
    microformat: 'Type your url on the input'
  })

  const regexURL = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

  const inputURL = useRef(null)
  const [inputs, setInputs] = useState<any>(false)
  let inputRef = useRef<any>([]);


  function changeFormat() { }

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
    setURL((state) => {
      return {
        ...state,
        name: { ...state.name, [idx]: inputRef.current[idx].value }
      }
    })
  }

  function dynamicInputs() {
    const dynamic = URL.decompose.map((el: string, idx: number) => {
      if (idx > 0) {
        return (

          <div
            className={`bloc_input bloc_input_col`}
            key={`dynamic-input-${idx}`}
          >
            <label>Name {idx}:</label>
            <input
              type="text"
              value={el.replace('.html', '')}
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

    const res =
      `<script type="application/ld+json">
  [{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": ${JSON.stringify(jsonLDItem(), null, 4)}
  }]
</script>`
    return res;
  }

  function formatJavascript() {
    const res = `
const structuredData = [{
'@context': 'https://schema.org',
'@type': 'BreadcrumbList',
itemListElement: [${javascriptItem()}]
}]

<script
  key="structured-data"
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
/>
`
    return String(res);
  }

  function javascriptItem() {

    let res = '\n'

    for (let i = 0; i < URL.decompose.length; i++) {
      const element = URL.decompose[i];
      if (i > 0) {

        if (i < URL.decompose.length - 1) {
          res += '\t{\n'
          res += `\t\t'@type': 'listItem',\n`
          res += `\t\tposition: ${i},\n`
          res += `\t\tname: '${URL.name[i]}',\n`
          res += `\t\titem: '${rebuildURL(i).replace('.html', '')}',\n`
          res += "\t},\n"
        } else {
          res += '\t{\n'
          res += `\t\t'@type': 'listItem',\n`
          res += `\t\tposition: ${i},\n`
          res += `\t\tname: '${URL.name[i].replace('.html', '')}',\n`
          res += '\t},\n'
        }
      }

    }
    return res;
  }

  function jsonLDItem() {

    const res = []

    for (let i = 0; i < URL.decompose.length; i++) {
      const element = URL.decompose[i];

      if (i > 0) {

        if (i < URL.decompose.length - 1) {
          res.push({
            "@type": "ListItem",
            "position": i,
            "name": URL.name[i].replace('.html', ''),
            "item": rebuildURL(i),
          })
        } else {
          res.push({
            "@type": "ListItem",
            "position": i,
            "name": URL.name[i].replace('.html', '')
          })
        }
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
  }, [URL])


  useEffect(() => {
    if (URL.path) {
      dynamicInputs();

      switch (format) {
        case 'jsonLD':
          setBreadcrumbResult({
            jsonLD: formatJsonLD(),
            javascript: '',
            microformat: ''
          })
          break;
        case 'javascript':
          setBreadcrumbResult({
            jsonLD: '',
            javascript: formatJavascript(),
            microformat: ''
          })
          break;
      }
    }
  }, [URL, format]);

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
              <label htmlFor="microformat">microformat</label>
              <input
                type="radio"
                id="microformat"
                name="format"
                defaultValue="microformat"
                onClick={() => { setFormat('microformat') }}
                checked={format === 'microformat'}
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

