import { useParams } from "react-router-dom";

const EditDoc = () => {
     const { id } = useParams();
  return (
    <>
    <div>EditDoc {id}</div>
    <textarea id="editor">Hello World!</textarea>
    </>

    
  )
}

export default EditDoc