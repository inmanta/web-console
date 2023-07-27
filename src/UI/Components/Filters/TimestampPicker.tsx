import React, { useEffect, useState } from "react";
import {
  TimePicker,
  DatePicker,
  isValidDate,
  yyyyMMddFormat,
  InputGroup,
} from "@patternfly/react-core";
import moment from "moment";
import styled from "styled-components";

interface Props {
  timestamp: Date | undefined;
  onChange: (timestamp: Date) => void;
  from: Date | undefined;
  datePickerLabel: string;
  timePickerLabel: string;
}

/** Both the Date and the Time Picker from Patternfly are in beta stage, e.g. validation doesn't work as expected */
export const TimestampPicker: React.FC<Props> = ({
  timestamp,
  onChange,
  from,
  datePickerLabel,
  timePickerLabel,
}) => {
  const [timeText, setTimeText] = useState("");
  useEffect(() => {
    if (timestamp === undefined) {
      setTimeText("");
    }
  }, [timestamp]);

  const onDateChange = (
    _event: React.FormEvent,
    inputString: string,
    inputDate: Date | undefined,
  ) => {
    if (
      timestamp &&
      inputDate &&
      isValidDate(timestamp) &&
      isValidDate(inputDate) &&
      validateDateFormat(inputString, inputDate)
    ) {
      inputDate.setHours(timestamp.getHours());
      inputDate.setMinutes(timestamp.getMinutes());
    }
    if (
      inputDate &&
      isValidDate(inputDate) &&
      validateDateFormat(inputString, inputDate)
    ) {
      onChange(new Date(inputDate));
    }
  };

  const onTimeChange = (time) => {
    setTimeText(time);
    if (timestamp && isValidDate(timestamp) && time.split(":").length === 2) {
      const [hour, minute] = time.split(":");
      const updatedDate = new Date(timestamp);
      if (hour.length === 2) {
        updatedDate.setHours(hour);
      }
      if (minute.length === 2) {
        updatedDate.setMinutes(minute);
      }
      onChange(updatedDate);
    }
  };

  return (
    <StyledInputGroup>
      <DatePicker
        value={
          timestamp && isValidDate(timestamp) ? yyyyMMddFormat(timestamp) : ""
        }
        dateParse={parseDate}
        onChange={onDateChange}
        rangeStart={from}
        aria-label={datePickerLabel}
      />

      <TimePicker
        style={{ width: "150px" }}
        onChange={onTimeChange}
        time={timeText}
        is24Hour
        isDisabled={!timestamp || !isValidDate(timestamp)}
        aria-label={timePickerLabel}
        inputProps={{ value: timeText }}
      />
    </StyledInputGroup>
  );
};

const StyledInputGroup = styled(InputGroup)`
  height: 65px;
`;

const formatDateWithSlashes = (date: Date): string => {
  return moment(date).format("YYYY/MM/DD");
};

const isValidSlashedFormat = (dateString: string): boolean =>
  moment(dateString, "YYYY/MM/DD", true).isValid();

const isValidDashedFormat = (dateString: string): boolean =>
  moment(dateString, "YYYY-MM-DD", true).isValid();

const validateDateFormat = (
  dateString: string,
  date: Date | string,
): boolean => {
  let formattedDate;
  if (typeof date === "string") {
    formattedDate = new Date(date);
  } else {
    formattedDate = date;
  }
  return (
    dateString === yyyyMMddFormat(formattedDate) ||
    dateString === formatDateWithSlashes(formattedDate)
  );
};

const parseDate = (val: string): Date => {
  if (isValidSlashedFormat(val)) {
    return moment(val, "YYYY/MM/DD", true).toDate();
  } else if (isValidDashedFormat(val)) {
    return new Date(`${val}T00:00:00`);
  }
  // The DatePicker component expects a function that returns a Date when the format is correct and undefined if it's not,
  // but the type declaration is not correct.
  return undefined as unknown as Date;
};
