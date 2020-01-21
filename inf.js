/* Auto Captcha Functions */

function getBase64Image(img) {
  document.getElementById("info").innerHTML = "Analyzing Captcha";
  $("#myModal").modal("show");
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
function promiseTimeout(time, res) {
  return new Promise(function(resolve) {
    var count = 7;
    var downloadTimer = setInterval(() => {
      document.getElementById("info").innerHTML =
        "Fetching Data: Stage 2/3 (Processing in " + (count - 1) + ")";
      count -= 1;
      if (count <= 0) {
        clearInterval(downloadTimer);
        resolve(res);
      }
    }, 1000);
  });
}

function imagedata() {
  document.getElementById("info").innerHTML = "Loading Captcha";
  $("#myModal").modal("show");
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    var bs64;
    xhr.open(
      "GET",
      "https://services.ecourts.gov.in/ecourtindia_v6/securimage/securimage_show.php?0.8442122184767482",
      true
    );
    xhr.responseType = "blob";
    xhr.onload = function(e) {
      if (this.status == 200) {
        var myBlob = this.response;
        //console.log(myBlob);
        var reader = new FileReader();
        reader.readAsDataURL(myBlob);
        reader.onloadend = function() {
          var base64data = reader.result;
          resolve(base64data.replace(/^data:image\/(png|jpg);base64,/, ""));
        };
      } else {
        error => {
          reject(error);
        };
      }
    };
    xhr.onerror = function(e){
      reject("Unknown Error Occured. Server response not received."+e);
    };
    xhr.send();
  });
}

function solve_captcha(imageblob) {
  document.getElementById("info").innerHTML = "Fetching Data: Stage 1/3";
  $("#myModal").modal("show");
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "POST",
      url:
        "https://azcaptcha.com/in.php?json=1&action=get&header_acao=1&proxytype=https&method=base64",
      data: {
        method: "base64",
        key: "hzzdxpc7kxshmosteov6b10eya8rflfw",
        body: imageblob
      },
      success: function(result) {
        resolve(result);
      },
      error: function(err) {
        reject(err);
        console.log(err);
      }
    });
  });
}

function get_solved_captcha(res) {
  document.getElementById("info").innerHTML = "Fetching Data: Stage 3/3";
  $("#myModal").modal("show");
  const obj = JSON.parse(res);
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url:
        "https://azcaptcha.com/res.php?key=hzzdxpc7kxshmosteov6b10eya8rflfw&action=get&header_acao=1&proxytype=https&id=" +
        obj.request,
      success: function(result) {
        var statuscheck = result.split("|")[0];
        if (statuscheck === "OK") {
          resolve(result);
        } else {
          reject(result);
        }
      },
      error: function(error) {
        reject(error);
      }
    });
  });
}

/* iFunctions */

function sendResponse(data, pointer, user, mode) {
  document.getElementById("info").innerHTML = "Uploading Data";
  $("#myModal").modal("show");
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "POST",
      url: "https://portal.tridenters.com/api_new/savedata.php?table=case_data",
      data: {
        data: data,
        pointer: pointer,
        user: user,
        mode: mode
      },
      success: function(result) {
        if (result.status === "200" || "400") {
          resolve(result);
        } else {
          reject(result);
        }
      },
      error: function(error) {
        if (result.status === "200" || "400") {
          resolve(error);
        } else {
          reject(error);
        }
        console.log(error);
      }
    });
  });
}

function makeRequest(user, mode) {
  document.getElementById("info").innerHTML =
    "Requesting Next Record from server";
  $("#myModal").modal("show");
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "POST",
      url: "https://portal.tridenters.com/api_new/namepointer.php?type=get_case_pointer&pointer_type=hc",
      data: { user: user, mode: mode },
      success: function(result) {
        resolve(result);
      },
      error: function(error) {
        reject(error);
        console.log(error);
      }
    });
  });
}
function fetchresults(
  statecode,
  distcode,
  complexcode,
  captcha,
  petres_name,
  year,
  casestatus,
  bench_wid
) {
  document.getElementById("4").innerHTML = petres_name;
  document.getElementById("info").innerHTML = "Searching case details...";
  $("#myModal").modal("show");
  
  var complexcodeArr = complexcode.split("@");
  // var courtcode = complexcodeArr[1];
  // var courtcomplexcode = complexcodeArr[0];
  var courtcode = bench_wid;
  var courtcomplexcode = bench_wid;
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "POST",
      url:
        "https://services.ecourts.gov.in/ecourtindia_v6/cases_qry/index_qry.php?action_code=showRecords",
      data:
        "court_code=" +
        courtcode +
        "&state_code=" +
        statecode +
        "&dist_code=" +
        distcode +
        "&court_complex_code=" +
        courtcomplexcode +
        "&caseStatusSearchType=CSpartyName&captcha=" +
        captcha +
        "&f=" +
        casestatus +
        "&petres_name=" +
        petres_name +
        "&rgyear=" +
        year,
      success: function(result) {
        var val = JSON.parse(result);
        if (val.Error) {
          reject(val);
        } else if (
          val.totRecords == 0 &&
          val.con.every(currentValue => {
            return currentValue === null;
          })
        ) {
          reject("Empty");
        } else if (val.con === "Invalid Captcha") {
          reject("Invalid");
        } else {
          resolve(val);
        }
        console.log(val.Error);
      },
      error: function(error) {
        reject(error);
        console.log(error);
      }
    });
  });
}
function fetchExtraResults(data){
  // data.forEach( element => {
  //   for(let i=0; i<element.length;)
  // }
  // );
  var parsedData = JSON.parse(data)
  parsedData.forEach(element => {
      // console.log(element)
      if(element.pet_name === "") console.log("pet empty in ",element)
      if(element.res_name === "") console.log("res empty")
    });
  
 
}
function update(response) {
  document.getElementById("1").innerHTML = response[0].stateName;
  document.getElementById("2").innerHTML = response[0].cityName;
  document.getElementById("3").innerHTML = response[0].courtName;
  document.getElementById("4").innerHTML = response.petres_name;
  document.getElementById("5").innerHTML = response[0].case_year;
  document.getElementById("6").innerHTML = response[0].case_status;
}

function handleError(bug, user, mode, pointer) {
  if (bug.Error) {
    retry("Caught error from eCourts: " + bug.Error + ". Retrying in", 5);
    $("#myModal").modal("show");
  } else if (bug === "Empty") {
    console.log("No Data Found");
    sendResponse("400", pointer, user, mode);
    $("#myModal").modal("show");
    retry("No Records Found. Next Record in", 5);
  } else if (bug === "Invalid") {
    console.log("Invalid Captcha");
    $("#myModal").modal("show");
    retry("Invalid Captcha. Retrying in", 5);
  } else {
    retry("Unknown error. Check console", 10);
    window.location.reload()
    console.log(bug);
  }
}

function securimage_fail() {
  window.location.reload()
}

function retry(message, time) {
  return new Promise(function() {
    var count = time;
    var downloadTimer = setInterval(() => {
      document.getElementById("info").innerHTML = message + " : " + (count - 1);
      count -= 1;
      if (count <= 0) {
        clearInterval(downloadTimer);
        fun();
      }
    }, 1000);
  });
}

//
//namepointer.php

// var func = async() => {
//   response = await makeRequest(user, mode)
//   if (response.msg === "No records") {
//     document.getElementById("info").innerHTML = "No pointers";
//   } else {
//     result = await imagedata()
//     update(response);
//     solve_captcha(result)
//     answer = await
//   }
// }

var fun = () => {
  makeRequest(user, mode).then(response => {
    if (response.msg === "No records") {
      document.getElementById("info").innerHTML = "No pointers";
    } else {
      imagedata()
        .then(result => {
          update(response);
          solve_captcha(result)
            .then(answer => {
              return promiseTimeout(6000, answer);
            })
            .then(res => {
              get_solved_captcha(res)
                .then(solved => {
                  return solved.split("|")[1];
                })
                .then(captchatext => {
                  fetchresults(
                    response[0].state_id,
                    response[0].cityCode,
                    response[0].complexCode,
                    captchatext,
                    response[0].petres_name,
                    response[0].case_year,
                    response[0].case_status,
                    response[0].bench_wid
                  )
                    .then(data => {
                      if (
                        data.totRecords !== 0 &&
                        !data.con.every(currentValue => {
                          return currentValue === null;
                        })
                      ) {
                        sendResponse(data.con, response, user, mode)
                          .then(() =>
                            retry(
                              "Data Sent Successfully. New pointer loading in",
                              5
                            )
                          )
                          .catch(fault =>
                            handleError(fault, user, mode, response)
                          );
                      } else {
                        retry(
                          "There was an error: (error code 417, incomplete data recieved from eCourts server). Retrying in",
                          10
                        );
                      }
                    })
                    .catch(fetchError =>
                      handleError(fetchError, user, mode, response)
                    );
                })
                .catch(error => {handleError(error, user, mode, response);});
            })
            .catch(err => handleError(err, user, mode, response));
        })
        .catch(() => securimage_fail());
    }
  });
};

// var fun2 = () => {
//   makeRequest(user, mode).then(response => {
//     if (response.msg === "No records") {
//       document.getElementById("info").innerHTML = "No pointers";
//     } else {
//       imagedata()
//         .then(result => {
//           update(response);
//           solve_captcha(result)
//             .then(answer => {
//               return promiseTimeout(6000, answer);
//             })
//             .then(res => {
//               get_solved_captcha(res)
//                 .then(solved => {
//                   return solved.split("|")[1];
//                 })
//                 .then(captchatext => {
//                   fetchresults(
//                     response[0].state_id,
//                     response[0].cityCode,
//                     response[0].complexCode,
//                     captchatext,
//                     response[0].petres_name,
//                     response[0].case_year,
//                     response[0].case_status
//                   )
//                     .then(data => {
//                       if (
//                         data.totRecords !== 0 &&
//                         !data.con.every(currentValue => {
//                           return currentValue === null;
//                         })
//                       ) {
//                         sendResponse(data.con, response, user, mode)
//                         .then(() =>
//                           console.log('then running'),
//                             fetchExtraResults()
//                           )
//                           .then(() =>
//                             retry(
//                               "Data Sent Successfully. New pointer loading in",
//                               5
//                             )
//                           )
//                           .catch(fault =>
//                             handleError(fault, user, mode, response)
//                           );
//                       } else {
//                         retry(
//                           "There was an error: (error code 417, incomplete data recieved from eCourts server). Retrying in",
//                           10
//                         );
//                       }
//                     })
//                     .catch(fetchError =>
//                       handleError(fetchError, user, mode, response)
//                     );
//                 })
//                 .catch(error => handleError(error, user, mode, response));
//             })
//             .catch(err => handleError(err, user, mode, response));
//         })
//         .catch(() => securimage_fail());
//     }
//   });
// };

chrome.runtime.sendMessage(localStorage.getItem('eID'), [localStorage.getItem('user'), localStorage.getItem('mode'), "extract"], response => console.log(response));
