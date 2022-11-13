import { useEffect, useRef, useState, createRef, useContext } from "react";
import ReactDOMServer from 'react-dom/server';
import S from './Breadcrumb.module.scss';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { debounce } from '../../src/utils/debounce';
import { IconOpenPadlock } from "../../src/assets/svg/icones";
import { UI_context, UI_context_type } from "../../src/context/UI_Provider";

type URLTypes = {
  https: boolean,
  www: boolean,
  path: string,
  decompose: string[],
  name: string[]
}

enum Format {
  Javascipt = 'JAVASCRIPT',
  JsonLD = 'JSONLD',
  Microdata = 'MICRODATA',
  JSX = 'JSX'
}

// const BreadcrumbResultMicroData = (URL: URLTypes, type: string): string | JSX.Element => {
//   console.log(URL)

//   function makeBreadscrumb() {
//     for (let i = 0; i < URL.decompose.length; i++) {
//       const element = URL.decompose[i];

//       if (i > 0) {

//         if (i < URL.decompose.length - 1) {
//           obj = {
//             "@type": "ListItem",
//             "position": i,
//             "name": URL.name[i].replace('.html', ''),
//             "item": rebuildURL(i),
//           }

//         } else {
//           obj = {
//             "@type": "ListItem",
//             "position": i,
//             "name": URL.name[i].replace('.html', '')
//           }

//           if (i === URL.decompose.length - 1 && description) {
//             obj.description = description
//           }
//         }

//         res.push(obj)
//       }
//     }
//   }

//   if (type === 'string') {
//     return (ReactDOMServer.renderToString(<>

//       {/* <ol itemScope itemType="https://schema.org/BreadcrumbList">
//         <li itemProp="itemListElement" itemScope
//           itemType="https://schema.org/ListItem">
//           <a itemProp="item" href="https://example.com/books">
//             <span itemProp="name">Books</span></a>
//           <meta itemProp="position" content="1" />
//         </li>
//         ›
//         <li itemProp="itemListElement" itemScope
//           itemType="https://schema.org/ListItem">
//           <a itemScope itemType="https://schema.org/WebPage"
//             itemProp="item" itemID="https://example.com/books/sciencefiction"
//             href="https://example.com/books/sciencefiction">
//             <span itemProp="name">Science Fiction</span></a>
//           <meta itemProp="position" content="2" />
//         </li>
//         ›
//         <li itemProp="itemListElement" itemScope
//           itemType="https://schema.org/ListItem">
//           <span itemProp="name">Award winners</span>
//           <meta itemProp="position" content="3" />
//         </li>
//       </ol>
//        */}

//       {makeBreadscrumb()}

//     </>))
//   } else {
//     return (<h1>TOTO</h1>)
//   }
// }


console.log('test');

export default function BreadCrumb(): JSX.Element {

  const { UI, dispatch } = useContext(UI_context) as UI_context_type
  const [URL, setURL] = useState<URLTypes>({
    https: false,
    www: false,
    path: '',
    decompose: [],
    name: []
  });

  const [description, setDescription] = useState<string | false>(false)

  const [format, setFormat] = useState('javascript');
  const [breadcrumbResult, setBreadcrumbResult] = useState<any>({
    jsonLD: 'Type your url on the input',
    javascript: 'Type your url on the input',
    microdata: 'Type your url on the input'
  })
  const [breadcrumbJSX, setBreadcrumbJSX] = useState([])

  const regexURL = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

  const inputURL = useRef(null)
  const [inputs, setInputs] = useState<any>(false)
  let inputRef = useRef<any>([]);
  let inputDescription = useRef<any>([])

  //Handler

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
    console.log(inputDescription.current.value)
    setDescription(inputDescription.current.value)
  }

  function dynamicInputs() {

    const dynamic = URL.decompose.map((el: string, idx: number) => {

      const pageInput = <div
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

      if (idx === URL.decompose.length - 1) {
        return (
          <div key={`nested-input-${idx}`} >
            {pageInput}
            <div
              className={`bloc_input bloc_input_col bloc_input_nested`}
              key={`description-${idx}`}
            >
              <label>Page description:</label>
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
        return pageInput
      } else {
        return []
      }

    });
    setInputs(dynamic)
  }

  // Traitements


  function outputformated(type: string): string {

    if (URL.decompose.length === 0) {
      return 'Type your url on the input'
    }

    let output = ''

    switch (type) {

      case 'microdata':

        output +=
          `<ol itemScope itemType="https://schema.org/BreadcrumbList">
    ${htmlItem().trim()}
</ol>`

        return output.trim();

      case 'jsonLD':

        output =
          `<script type="application/ld+json">
  [{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListOrder: 'ItemListOrderAscending',
    "itemListElement": [${JSON.stringify(jsonLDItem(), null, 4)}]
  }]
</script>`
        return output;

      default:

        output = `
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
        return output.trim();
    }

  }

  // Utils

  function htmlItem() {
    let res = ''

    for (let i = 0; i < URL.decompose.length; i++) {

      if (i > 0) {

        res +=
          `   <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">`

        if (i < URL.decompose.length - 1) {
          res +=
            `<a itemProp="item" href="https://example.com/books">
        <span itemProp="name">Books</span></a>
        <meta itemProp="position" content="1" />`

        } else {
          res +=
            `<a itemProp="item" href="https://example.com/books">
        <span itemProp="name">Books</span></a>
        <meta itemProp="position" content="1" />
          `

          if (i === URL.decompose.length - 1 && description) {
            res +=
              `<meta itemProp="description" content="${description}" />`
          }
        }

        res += `\n\t</li>\n`

      }
    }
    return res;
  }

  function jsonLDItem() {

    let res = []
    let obj: any = {}

    for (let i = 0; i < URL.decompose.length; i++) {

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
            console.log('ola')
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
    setDescription(false)
    setBreadcrumbResult(
      {
        jsonLD: 'Type your url on the input',
        javascript: 'Type your url on the input',
        microdata: 'Type your url on the input'
      }
    )
    dispatch.breadcrumb(jsonLDItem())
  }, [URL])

  useEffect(() => {
    if (URL.path) {
      dynamicInputs();

      switch (format) {
        case 'jsonLD':
          setBreadcrumbResult({
            jsonLD: outputformated('jsonLD'),
            javascript: '',
            microdata: ''
          })
          break;
        case 'javascript':
          setBreadcrumbResult({
            jsonLD: '',
            javascript: outputformated('javascript'),
            microdata: ''
          })
          break;
        case 'microdata':
          setBreadcrumbResult({
            jsonLD: '',
            javascript: '',
            microdata: outputformated('microdata'),
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
            language={format === 'microdata' ? 'html' : 'javascript'}
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
