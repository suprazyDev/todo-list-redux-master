import { createStore } from "redux";
import nanoid from "nanoid";

const $todolist = document.querySelector(".todo-list");
const $todoinput = document.querySelector(".input");
const $todoAddButton = document.querySelector(".js-add-button");
const $filterButtons = document.querySelectorAll(".filter-button");

const TodoItem = (id, text, done) => `
  <li class="todo-list-item">
    <label class="checkbox">
      <input type="checkbox" ${done ? "checked" : ""} data-id="${id}" />
      ${text}
    </label>
  </li>
`;

const INITIAL_STATE = {
  selectedFilter: "todas",
  list: JSON.parse(localStorage.getItem("todo-list")) || {}
};

function todoReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "ADD_NEW_TODO":
      const { value } = action.payload;
      return {
        ...state,
        list: {
          ...state.list,
          [nanoid()]: {
            text: value,
            done: false
          }
        }
      };
    case "TOGGLE_TODO":
      const { id } = action.payload;
      return {
        ...state,
        list: {
          ...state.list,
          [id]: {
            ...state.list[id],
            done: !state.list[id].done
          }
        }
      };
    case "SET_SELECTED_FILTER":
      const { selectedFilter } = action.payload;
      return {
        ...state,
        selectedFilter
      };

    default:
      return state;
  }
}

const store = createStore(todoReducer);

const render = () => {
  const state = store.getState();
  console.log(state);
  const { list, selectedFilter } = state;

  $todolist.innerHTML = null;

  for (const key in list) {
    if (selectedFilter === "todas") {
      $todolist.innerHTML += TodoItem(key, list[key].text, list[key].done);
    }
    if (selectedFilter === "activas" && list[key].done === false) {
      $todolist.innerHTML += TodoItem(key, list[key].text, list[key].done);
    }
    if (selectedFilter === "completadas" && list[key].done === true) {
      $todolist.innerHTML += TodoItem(key, list[key].text, list[key].done);
    }
  }

  $todoinput.value = null;

  const $listItems = document.querySelectorAll(".todo-list-item");
  $listItems.forEach(element => {
    element.addEventListener("click", event => {
      const id = event.target.getAttribute("data-id");
      store.dispatch({ type: "TOGGLE_TODO", payload: { id } });
    });
  });
  localStorage.setItem("todo-list", JSON.stringify(list));
  console.log(localStorage.getItem("todo-list"));
};

render();

store.subscribe(render);

$todoAddButton.addEventListener("click", () => {
  const value = $todoinput.value;
  if (value !== "") {
    store.dispatch({ type: "ADD_NEW_TODO", payload: { value } });
  }
});

$filterButtons.forEach($filterButton => {
  $filterButton.addEventListener("click", event => {
    const filterClicked = event.target;
    const filter = filterClicked.textContent.toLowerCase();
    $filterButtons.forEach($filterButton => {
      $filterButton.removeAttribute("disabled", "disabled");
    });

    filterClicked.setAttribute("disabled", "");

    store.dispatch({
      type: "SET_SELECTED_FILTER",
      payload: { selectedFilter: filter }
    });
  });
});
