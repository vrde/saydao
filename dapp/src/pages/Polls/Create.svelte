<h1>Create Poll</h1>

<form>
  <label>Title of the Poll
    <input type="text" name="title"/>
  </label>

  <label>Body of the Poll
    <textarea></textarea>
  </label>

  <fieldset>
    <legend>Options (at least two)</legend>
    <ul>
      <li>
        <input type="text"/>
      </li>
      <li>
        <input type="text"/>
      </li>
    </ul>
    <button>Add another one</button>
  </fieldset>

  <label>How long should be the poll last?
    <select>
      <option>1 day</option>
      <option>7 days</option>
      <option>1 month</option>
    </select>
  </label>

  <button type="submit">Submit</button>
</form>
