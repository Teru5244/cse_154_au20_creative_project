# Dragon Slayer Epic API Documentation
*Fill in a short description here about the API's purpose.*

## Get a bunch of enemies objects in chapter 2.
**Request Format:** ch2/gen

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** With the parameter `wave`, the API will automatically generate a list of enemies. Parameter wave must be integer and must be bigger than 0 and is required for GET requests.

**Example Request:** /ch2/gen?wave=4

**Example Response:**
```json
{
  "status": "success",
  "detail": [
    {
      "name": "Normal Treasure Seeker",
      "hp": 28,
      "img": "img/hunter1.png"
    }
  ]
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (All returned in JSON):
  - If the wave parameter passed is invalid, returns a JSON.
  ```json
  {
    "status": "error",
    "detail": "Invalid wave parameter."
  }
  ```

## Post the information of one move to the API.
**Request Format:** /ch3/report endpoint with POST parameters of `round`, `pl-move`, `pl-atk`, `pl-hp`, `ene-move`, `ene-atk`, and `ene-hp`.

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** This will record one move of player and enemy with the given parameters containing the basic information of each. If the data has been successfully recorded, this will return a JSON object contains which round has been recorded.

**Example Request:** /ch3/report with POST parameters of `round=1`, `pl-move=attack`, `pl-atk=41`, `pl-hp=100`, `ene-move=magic`, `ene-atk=0`, and `ene-hp=959`.

**Example Response:**
```
Round 1 progress recorded.
```

**Error Handling:**
- Possible 400 (invalid request) errors (All returned in JSON):
  - If one or more of the parameters do not exist, returns an error in JSON.
  ```json
  {
    "status": "error",
    "detail": "Missing required parameters."
  }
  ```
- Possible 500 (internal server error) errors (All returned in JSON):
  - If some errors occur during the read/write file stage, returns and error in JSON format.
  ```json
  {
    "status": "error",
    "detail": "Unknown server error happened."
  }
  ```

## Get the results of the whole battle.
**Request Format:** /ch3/results

**Request Type**: GET

**Returned Data Format**: JSON

**Description:** Requires parameter `rounds`. `rounds=all` will return all the rounds recorded in the server file. Other values of parameter rounds are not allowed for now.

**Example Request:** /ch3/results?rounds=all

**Example Response:**
```json
{
  "results":[
    {
      "round":"1",
      "player":{"move":"attack","attack":"47","remaining-hp":"90"},
      "enemy":{"move":"attack","attack":"10","remaining-hp":"953"}
    },
    {
      "round":"2",
      "player":{"move":"dodge","attack":"0","remaining-hp":"93"},
      "enemy":{"move":"attack","attack":"9","remaining-hp":"953"}
    }
  ]
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (All returned in JSON):
  - If the parameter `rounds` does not exist, returns the error in JSON format.
  ```json
  {
    "status": "error",
    "detail": "Missing required parameter."
  }
  ```
  - If the parameter does not equal to `all`, returns the error in JSON format.
  ```json
  {
    "status": "error",
    "detail": "Unexpected rounds selection."
  }
  ```
- Possible 500 (internal server error) errors (All returned in JSON):
  - If some errors occur during the read/write file stage, returns and error in JSON format.
  ```json
  {
    "status": "error",
    "detail": "Unknown server error occured."
  }
  ```
