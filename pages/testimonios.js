import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import GetAppIcon from "@material-ui/icons/GetApp";
import { AnimatePresence, motion } from "framer-motion";
import { db } from "../src/firebase";
import { Spinner } from "@chakra-ui/react";
import * as htmlToImage from "html-to-image";
import { toPng } from "html-to-image";
import download from "downloadjs";

//Components
import Copyright from "../components/Copyright";

//Framer Motion Variants
const variantsTestimonio = {
  visible: (i) => ({
    opacity: 1,
    transition: {
      delay: i * 0.15,
    },
  }),
  hidden: { opacity: 0 },
};

//Handle Download
const handleDownload = (ref, id) => {
  htmlToImage.toPng(ref.current).then(function (dataUrl) {
    download(dataUrl, `${id}.png`);
  });
};

const Testimonio = ({ t, i }) => {
  const pronounsToString = () => {
    let aux = "";
    if (t.data.pronouns[0]) aux = aux.concat("", t.data.pronouns[0]);
    if (t.data.pronouns[1]) aux = aux.concat("/", t.data.pronouns[1]);
    if (t.data.pronouns[2]) aux = aux.concat("/", t.data.pronouns[2]);
    if (t.data.pronouns[3]) aux = aux.concat("/", t.data.pronouns[3]);
    return aux;
  };

  const componentRef = useRef();

  return (
    <motion.div
      ref={componentRef}
      custom={i}
      initial="hidden"
      animate="visible"
      variants={variantsTestimonio}
      key={i}
      className="testimonio"
    >
      <div className="header">
        <div className="wrapper">
          <div className="age">
            <span>🎂</span>
            {t.data.age}
          </div>
          <div className="pronouns">{pronounsToString()}</div>
        </div>
        <div
          onClick={() => handleDownload(componentRef, t.id)}
          className="download"
        >
          <GetAppIcon />
        </div>
      </div>
      <div className="message">{t.data.message}</div>
    </motion.div>
  );
};

const testimonios = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);

  const loadMore = () => {
    console.log("Dame mas perro");

    db.collection("testimonios")
      .orderBy("date", "desc")
      .startAfter(lastDoc)
      .limit(10)
      .get()
      .then(function (snapshot) {
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          const aux = snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));
          setTestimonios((testimonios) => [...testimonios, ...aux]);
        } else {
          document.querySelector(".load-more").classList.add("hide");
        }
      });
  };

  const fetchMessages = () => {
    db.collection("testimonios")
      .orderBy("date", "desc")
      .limit(10)
      .get()
      .then(function (snapshot) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

        setTestimonios(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        );
      });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <>
      <Head>
        <title>Testimonios • Girl anda a terapia</title>
      </Head>
      <div className="testimonios">
        <div className="overlay"></div>
        <div className="top-header">
          <div className="title">Testimonios</div>
          {/* <div className="favoritos">
          <StarIcon />
          <span>Favoritos</span>
        </div> */}
        </div>
        <div className="wrapper">
          <AnimatePresence exitBeforeEnter>
            {testimonios.map((t, i) => {
              return <Testimonio key={t.id} t={t} i={i} />;
            })}
            {testimonios.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="load-more"
                onClick={() => loadMore()}
              >
                Cargar más...
              </motion.div>
            )}
          </AnimatePresence>
          {testimonios.length < 1 && (
            <Spinner thickness="4px" size="xl" color="brand.100" />
          )}
        </div>
      </div>
      <Copyright />
    </>
  );
};

export default testimonios;
