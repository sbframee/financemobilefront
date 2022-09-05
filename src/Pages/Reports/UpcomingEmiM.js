import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import JsPDF from "jspdf";
import HeaderAdminM from "../../components/HeaderAdminM";

const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
let date = new Date();
let initials = {
  startDate: date,
  endDate: date,
  invoiceNumberFilter: "",
  status: 0,
};
const UpcomingEmiM = () => {
  const [items, setItems] = useState([]);
  const [searchData, setSearchData] = useState(initials);
  const [popupForm, setPopupForm] = useState(false);

  const getCompleteOrders = async () => {
    let startDate = new Date(searchData.startDate).toDateString();
    startDate = new Date(startDate + " 00:00:00 AM");
    startDate = startDate.getTime();
    let endDate = new Date(searchData.endDate).toDateString();
    endDate = new Date(endDate + " 00:00:00 AM").getTime() + 86400000;
    const response = await axios({
      method: "post",
      url: "/cases/GetEmiList",
      data: { startDate, endDate, status: searchData.status },
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("activity", response);
    if (response.data.success) setItems(response.data.result);
    else setItems([]);
  };

  useEffect(() => {
    setSearchData(initials);
  }, []);

  let itemsDetails = useMemo(
    () =>
      items.filter(
        (a) =>
          !searchData.invoiceNumberFilter ||
          a.customer_firstname
            ?.toString()
            ?.includes(searchData.invoiceNumberFilter.toLocaleLowerCase()) ||
          a.customer_middlename
            ?.toString()
            ?.includes(searchData.invoiceNumberFilter.toLocaleLowerCase()) ||
          a.customer_lastname
            ?.toLocaleLowerCase()
            ?.includes(searchData.invoiceNumberFilter.toLocaleLowerCase()) ||
          a.case_number
            ?.toString()
            ?.includes(searchData.invoiceNumberFilter.toLocaleLowerCase()) ||
          a.mobile.filter((b) =>
            b.number
              ?.toString()
              ?.includes(searchData.invoiceNumberFilter.toLocaleLowerCase())
          ).length
      ),
    [searchData, items]
  );
  let sheetData = useMemo(
    () =>
      itemsDetails.map((a) => {
        // console.log(a)
        return {
          "Article Title": a.article_title,
          Customer:
            a.customer_firstname +
            " " +
            a.customer_middlename +
            " " +
            a.customer_lastname,
          "Case Number": a.case_number,
          Mobile:
            a.mobile.length > 1
              ? a.mobile
                  .map((b, i) => (i === 0 ? b.number : ", " + b.number))
                  ?.reduce((a, b) => a + b)
              : a.mobile.length
              ? a.mobile[0].number
              : "",
          Date: new Date(a?.date || "").toDateString(),
          "Instalment Count":
            (a.installment_count || 0) + "/" + (a.installment_no || 0),
          Amount: a.amount,
        };
      }),
    [itemsDetails]
  );
  const handlePrint = async () => {
    // let sheetData = menuData.category_and_items.map(a=>a.menu_items.map(b=>({category_uuid:a.category_uuid,...b})))

    // console.log(sheetData)
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "EmiReport" + fileExtension);
  };
  const printDocument = () => {
    const report = new JsPDF("portrait", "pt", "a4");
    report.html(document.getElementById("daily-summary")).then(() => {
      report.save("EmiReport.pdf");
    });
  };
  return (
    <>
      
      
      <div>
      <HeaderAdminM />
        <div id="heading">
          <h2>UpcomingEmi</h2>
        </div>
        <div id="item-sales-top">
          <div
            id="date-input-container"
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <label className="selectLabel">
              Customers
              <input
                type="number"
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    invoiceNumberFilter: e.target.value,
                  }))
                }
                value={searchData.invoiceNumberFilter}
                placeholder="Search Customer..."
                className="searchInput"
                onWheel={(e) => e.preventDefault()}
              />
            </label>
            </div>
            </div>
            <div id="item-sales-top">
          <div
            id="date-input-container"
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <label className="selectLabel">
              Start Date
              <DatePicker
                id="date-from"
                className="numberInput"
                dateFormat="d/M/y"
                selected={searchData?.startDate || ""}
                maxDate={searchData?.endDate || ""}
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    startDate: new Date(e),
                  }))
                }
                style={{ textAlign: "center" }}
                wrapperClassName=""
                shouldCloseOnSelect={false}
                isCalendarOpen={true}
              />
            </label>
            <label className="selectLabel">
              End Date
              <DatePicker
                id="date-from"
                className="numberInput"
                dateFormat="d/M/y"
                selected={searchData?.endDate || ""}
                minDate={searchData?.startDate || ""}
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    endDate: new Date(e),
                  }))
                }
                style={{ textAlign: "center" }}
                wrapperClassName=""
                shouldCloseOnSelect={false}
                isCalendarOpen={true}
              />
            </label>
            </div>
            </div>
            <div id="item-sales-top">
          <div
            id="date-input-container"
            style={{
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <label className="selectLabel">
              Status
              <select
                type="text"
                onChange={(e) =>
                  setSearchData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                value={searchData.status}
                placeholder="Search User..."
                className="searchInput"
              >
                <option value={0}>Pending</option>
                <option value={1}>Delivered</option>
              </select>
            </label>
            <button className="item-sales-search" onClick={getCompleteOrders}>
              Search
            </button>
            {itemsDetails.length ? (
              <div className="flex">
                <button
                  type="button"
                  className="item-sales-search"
                  onClick={handlePrint}
                >
                  Excel
                </button>
                <button
                  type="button"
                  className="item-sales-search"
                  onClick={printDocument}
                >
                  PDF
                </button>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
        <div
          style={{ minHeight: "70vh" }}
        >
          <Table
            itemsDetails={itemsDetails}
            completed={searchData.status}
            popupInfo={popupForm}
            setPopup={setPopupForm}
          />
        </div>
      </div>
      {popupForm ? (
        <NewUserForm
          onSave={() => {
            setPopupForm(false);
            getCompleteOrders();
          }}
          popupInfo={popupForm}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default UpcomingEmiM;

function Table({ itemsDetails, completed, setPopup }) {
  return (
    <>
      <table
        className="user-table"
        style={{
          maxWidth: "100vw",
          height: "fit-content",
          overflowX: "scroll",
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "50px" }}>S.N</th>
            <th>Article Title</th>
            <th>Customer</th>
            <th>Case Number</th>
            <th>Mobile</th>
            <th> Date</th>
            <th> Installment Count</th>
            <th>Amount</th>
            {completed ? "" : <th>Action</th>}
          </tr>
        </thead>
        <tbody className="tbody">
          {itemsDetails?.map((item, i, array) => (
            <tr key={Math.random()} style={{ height: "30px" }}>
              <td>{i + 1}</td>
              <td>{item.article_title}</td>

              <td>
                {item.customer_firstname +
                  " " +
                  item.customer_middlename +
                  " " +
                  item.customer_lastname}
              </td>
              <td>{item.case_number || 0}</td>
              <td>
                {item.mobile.length
                  ? item.mobile.map((a, i) =>
                      i === 0 ? a.number : ", " + a.number
                    )
                  : ""}
              </td>

              <td>{new Date(item.date).toDateString() || ""}</td>
              <td>
                {(item.installment_count || 0) +
                  "/" +
                  (item.installment_no || 0)}
              </td>
              <td>{item.amount || ""}</td>
              {completed ? (
                ""
              ) : (
                <td
                  className="flex"
                  style={{ justifyContent: "space-between" }}
                >
                  <button
                    type="button"
                    className="item-sales-search"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopup({ type: "edit", data: item });
                    }}
                  >
                    Pay Now
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          // display: "none",
          position: "fixed",
          top: -100,
          left: -180,
          zIndex: "-1000",
          fontSize: "5px",
        }}
      >
        <table id="daily-summary">
          <thead>
            <tr>
              <th >S.N</th>
              <th>Article Title</th>
              <th>Customer</th>
              <th>Case Number</th>
              <th>Mobile</th>
              <th style={{ width: "150px" }}> Date</th>
              <th> Installment Count</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody className="tbody">
            {itemsDetails?.map((item, i, array) => (
              <tr key={Math.random()} >
                <td>{i + 1}</td>
                <td>{item.article_title}</td>

                <td>
                  {item.customer_firstname +
                    " " +
                    item.customer_middlename +
                    " " +
                    item.customer_lastname}
                </td>
                <td>{item.case_number || 0}</td>
                <td>
                  {item.mobile.length
                    ? item.mobile.map((a, i) =>
                        i === 0 ? a.number : ", " + a.number
                      )
                    : ""}
                </td>

                <td style={{ width: "150px" }}>
                  {new Date(item.date).toDateString() || ""}
                </td>
                <td>
                  {(item.installment_count || 0) +
                    "/" +
                    (item.installment_no || 0)}
                </td>
                <td>{item.amount || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function NewUserForm({ onSave, popupInfo }) {
  const [data, setdata] = useState({});

  useEffect(() => {
    if (popupInfo?.type === "edit") setdata(popupInfo.data);
  }, [popupInfo.data, popupInfo?.type]);
  console.log(data);
  const submitHandler = async (e) => {
    e.preventDefault();

    let obj = { ...data, user_uuid: localStorage.getItem("user_uuid") };

    const response = await axios({
      method: "put",
      url: "/cases/putInvestment",
      data: obj,
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data.success) {
      onSave();
    }
  };

  return (
    <div className="overlay">
      <div
        className="modal"
        style={{ height: "fit-content", width: "fit-content" }}
      >
        <div
          className="content"
          style={{
            height: "fit-content",
            padding: "20px",
            width: "fit-content",
          }}
        >
          <div style={{ overflowY: "scroll", paddingTop: "20px" }}>
            <form className="form" onSubmit={submitHandler}>
              <div className="row">
                <h1>Payments </h1>
              </div>

              <button
                className="submit"
                style={{ background: "none", color: "#000" }}
              >
                EMI:{data.amount}
              </button>
              <button type="submit" className="submit">
                Confirm
              </button>
            </form>
          </div>
          <button onClick={onSave} className="closeButton">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
