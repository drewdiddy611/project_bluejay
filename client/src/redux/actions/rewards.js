import { startRequest, failedRequest } from "./index";

export const GET_ALL_REWARDS = "GET_ALL_REWARDS";
export const GET_ONE_REWARD = "GET_ONE_REWARD";
export const ADD_REWARD = "ADD_REWARD";
export const UPDATE_REWARD = "UPDATE_REWARD";
export const REMOVE_REWARD = "REMOVE_REWARD";
export const REDEEM_REWARD = "REDEEM_REWARD";

export const getRewards = rewards => ({
  type: GET_ALL_REWARDS,
  data: rewards
});

const addReward = reward => ({
  type: ADD_REWARD,
  data: reward
});

const updateReward = (id, reward) => ({
  type: UPDATE_REWARD,
  data: {
    id: id,
    reward
  }
});

const removeReward = id => ({
  type: REMOVE_REWARD,
  data: id
});

///let the students purchase a reward
//NOT IMPLEMENTED
export const redeemReward = (reward, studentId) => async dispatch => {
  dispatch(startRequest());
  //make a copy of the reward
  const copy = new reward.toNewObj();
  let response;
  try {
    response = await fetch(`/api/students/${studentId}/rewards`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: copy
    });
    const data = await response.json();
    if (!data.success) {
      throw data.apiData;
    }
    const newReward = data.apiData;
    dispatch(addReward(newReward));
  } catch (e) {
    console.error(e);
    dispatch(failedRequest(e));
  }
};

//NOT WORKING
//create a new kind of reward
export const createReward = (teacherId, reward) => async dispatch => {
  dispatch(startRequest());
  const newReward = {
    kind: reward.kind || "loot",
    description: reward.description || "new reward",
    cost: reward.cost || undefined,
    value: reward.value || undefined,
    teacher: teacherId,
    available: reward.available || true
  };
  const response = await fetch(`/api/rewards`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ teacher: teacherId, ...newReward })
  });
  // console.log("response from createReward API = ", response);
  const data = await response.json();
  //check for server errors
  // console.log("response from createReward API = ", data);
  if (!data.success) {
    console.error(data.apiError);
    return;
  }
  //TODO: double check that we're getting this back from server
  dispatch(addReward(data.apiData));
};

//get all the rewards for a teacher
export const getAllRewards = (userId, userKind) => async dispatch => {
  dispatch(startRequest());

  //use correct input for students and teachers
  let endpoint = `/api/teachers/${userId}/rewards`;
  if (userKind === "Student") {
    endpoint = `/api/students/${userId}/rewards`;
  }
  let response;
  try {
    response = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: null
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
  response = await response.json();
  if (!response.success) {
    console.error(response.apiError);
    return null;
  }
  dispatch(getRewards(response.apiData));
};

//works??
export const editReward = (id, updates) => async dispatch => {
  dispatch(startRequest());
  // console.log("new reward = ", updates);
  let response = await fetch(`/api/rewards/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updates)
  });
  // console.log("response = ", response);
  response = await response.json();
  // console.log("response = ", response);
  //do some things
  if (!response.success) {
    console.error(response.apiError);
    dispatch(failedRequest(response.apiError));
  } else {
    dispatch(updateReward(response.apiData._id, response.apiData));
  }
};

//NOT TESTED
//TESTED, NON-FUNCTIONING, API => 500
export const deleteReward = id => async dispatch => {
  dispatch(startRequest());
  const response = await fetch(`/api/rewards/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: null
  });
  //TODO: SHOULD THESE USE THE response success flag?
  // console.log("response = ", response);
  const data = await response.json();
  // console.log("data = ", data);
  if (!data.success) {
    console.error(data);
    dispatch(failedRequest(data));
  } else {
    //delete from redux
    dispatch(removeReward(data.apiData._id));
  }
};