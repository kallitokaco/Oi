import {ADD_SLIDE, DEL_SLIDE, EDIT_STEP, ACTIVE_STEP} from '../actions/actions';
import {step} from '../types/step';
import {start} from '../example/start';

const defaultState = start;

export function slides (state = [...defaultState], action) {
  switch (action.type) {
    case ADD_SLIDE:
      return newSlide( state, action.slide);
      
    case DEL_SLIDE:
      return deleteSlide( state );
      
    case EDIT_STEP:
      return editStep( state, action.target, action.data);
      
    case ACTIVE_STEP:
      return updateActive( state, 
                           action.id);
    default:
      return state;
  }
}

let _index = 1;

// 將 element init 成 impress step，並填回 style
function impressingStep(step, isNew){
  let _api = impress();
  let elem = step.toElement();
  
  isNew ? _api.newStep(elem) : _api.initStep(elem);
  step['style'] = elem.style;
}

// 更新 active 狀態
function updateActive(_oldState, _id){
  let _api = impress();
  let newState = new Array();
  
  _oldState.forEach((s) => {
    s.active = s.id === _id ? true : false;
    newState.push(s);
  });
  
  if (_id === -1 || _id === 'overview')
    _api.goto('overview');
    
  return newState;
}

// 新增 slide element
function newSlide(_oldState, _newSlide){
  let _api  = impress();
  let _move = _index++;
  let _step = new step({
    id: 'o-impress-' + _move,
    active: true,
    content: _newSlide.content,
    data: {
      x: parseInt(_newSlide.x),
      y: parseInt(_newSlide.y),
      z: parseInt(_newSlide.z),
      scale: parseInt(_newSlide.scale),
      rotate: parseInt(_newSlide.rotate),
      rotateX: parseInt(_newSlide.rotateX),
      rotateY: parseInt(_newSlide.rotateY),
      rotateZ: parseInt(_newSlide.rotate),
    }
  });
  
  impressingStep(_step, true);
  
  _oldState.push(_step);
  
  return updateActive(_oldState, _step.id);
}

// 刪除 slide element
function deleteSlide(_oldState){
  let _api = impress();
  let _activeStep = _api.getActiveStep();
  let _cur = _oldState.findIndex((s) => s.id === _activeStep.id);
  let _prev = _cur -1;
  let _impressTarget = _cur + 1; // cus 'slidesData[0]' in impress is 'overview' in this case
  
  if ( _cur === -1 )
    alert('Sorry, you could not delete #OVERVIEW.');
  else
  {
    _api.delStep(_impressTarget);
    
    let _newState = _oldState.filter((value, index) => index !== parseInt((_cur)));
    let _prevStep = _newState[_prev] ? _newState[_prev].id : -1;
    
    return updateActive(_newState, _prevStep);
  }
  
  return _oldState;
}

// 編輯 step element
function editStep(_oldState, target, data){
  let _api = impress();
  target = _oldState.findIndex((s) => s === target);
  
  if (data.name === 'content')
    _oldState[target][data.name] = data.value;
  else
  {
    if ( data.name === 'rotate' )
      _oldState[target].data['rotateZ'] = data.value;
      
    _oldState[target].data[data.name] = data.value;
    
    impressingStep(_oldState[target], false);
  }
  
  return [..._oldState];
}