<h1>Create a Poll</h1>

<form>
  <label>What is the title of the poll?
    <input type="text" name="title"/>
  </label>

  <label>What is the poll question?
    <textarea></textarea>
  </label>

  <fieldset>
    <legend>What are the choices in the poll? Enter at least two.</legend>
    <ul>
      <li>
        <input type="text"/>
      </li>
      <li>
        <input type="text"/>
      </li>
    </ul>
    <button>Add more poll options</button>
  </fieldset>

  <label>How long should be the poll stay open?
    <select>
      <option>1 hour</option>
      <option>1 day</option>
      <option>1 week</option>
      <option>1 month</option>
    </select>
  </label>

  <button type="submit">Launch poll</button>
</form>
