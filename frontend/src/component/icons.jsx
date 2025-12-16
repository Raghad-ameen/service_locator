import Trash from '../assets/trash.svg'
import Pencil from '../assets/edit-bing.svg'
import Magic from '../assets/magicpen.svg'
import star from '../assets/star.svg'
const TrashIcon = ({ OnClick, className }) => {
  return (
    <div onClick={OnClick} className='h-fit w-fit'>
      <img src={Trash} className={`w-4.5 h-5 cursor-pointer object-cover ${className}`}/>
    </div>
  );
};
const PencilIcon = ({ OnClick, className, imageclass }) => {
  return (
    <div onClick={OnClick} className={className}>
      <img src={Pencil} className={`cursor-pointer ${imageclass}`}/>
    </div>
  )
}
const Magicpen =({OnClick}) =>{
  return(
    <div onClick={OnClick}>
      <img src={Magic} className='w-4.5 h-5'/>
    </div>
  )
}
const Star =({OnClick}) =>{
  return(
    <div onClick={OnClick}>
      <img src={star} className='w-4.5 h-5'/>
    </div>
  )
}
export {TrashIcon, PencilIcon, Magicpen, Star}