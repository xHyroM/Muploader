import type { NextPage } from 'next';
import Head from 'next/head';
import { createRef, LegacyRef, useEffect, useState } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import styles from '../styles/Home.module.css';
import axios from 'axios';
import Link from 'next/link';

const Home: NextPage = () => {
  const recaptchaRef: LegacyRef<ReCAPTCHA> = createRef();
  const [fileName, setFileName] = useState('Nothing');
  const [infoAlert, setInfoAlert]: any = useState({ nothing: true });

  useEffect(() => {
    const $recaptcha = document.querySelector('#g-recaptcha-response');
    if($recaptcha) $recaptcha.setAttribute("required", "required");
  })

  const handleSubmit = async(event: any) => {
    event.preventDefault();

    if (recaptchaRef.current?.getValue()?.length === 0) return;
  
    const form = new FormData();

    let file: any = document.getElementById('fileInput');
    file = file?.files?.[0] || file;

    if (file.size > 1000000000) return setInfoAlert({ message: 'Maximum allowed size is 1GB' });

    form.append('file', file);
    form.append('gcaptcha', recaptchaRef.current?.getValue() || 'none');

    recaptchaRef.current?.reset();

    const res = await axios({
      method: 'POST',
      url: '/api/uploadFile',
      data: form,
      onUploadProgress: (p) => {
        setInfoAlert({ message: `${p.loaded} / ${p.total}` });
      }
    }).catch(e => e?.response)

    if (res.data?.message?.path) setInfoAlert({
      url: `${window.location}api/files?id=${res.data.message.path}`,
      deleteUrl: `${window.location}api/files?id=${res.data.message.path}&del=true`
    });
    else setInfoAlert({ message: `Error: ${res.data.message} (${res.status})` })

    const fileUploadForm: any = document.getElementById('fileUploadForm');
    fileUploadForm?.reset();
    setFileName('Nothing');

    return;
  }

  const changeInput = (obj: any) => {
    const name = obj.target.files[0].name;
    setFileName(name);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Easy to share files!
        </h1>

        { !infoAlert.nothing ? <div className="notification is-primary is-light">
          { infoAlert.url ? 
          <><Link href={infoAlert.url}><a>Download: {infoAlert.url}</a></Link><br /><Link href={infoAlert.deleteUrl}><a>Delete: {infoAlert.deleteUrl}</a></Link></>
          : infoAlert.message }
        </div> : '' } 

        <form className="box" onSubmit={handleSubmit} id='fileUploadForm'>
          <div className="field file is-boxed is-fullwidth">
            <label className="file-label">
              <input className="file-input" onChange={changeInput} type="file" name="resume" id='fileInput' required/>
              <span className="file-cta">
                <span className="file-icon">
                  <i className="fas fa-upload"></i>
                </span>
                <span className="file-label">
                  Choose a file…
                </span>
              </span>
              <span className="file-name">
                { fileName }
              </span>
            </label>
          </div>

          <div className="field is-boxed">
            <ReCAPTCHA
              ref={recaptchaRef}
              size='normal'
              sitekey={process.env.SITE_KEY || '6Lclp5UdAAAAABDuMBby76TirdHWs6MNfawyK-8B'}
	          />
          </div>

          <div className="field control has-text-centered">
            <button className="button is-primary" type='submit'>Submit</button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Home;