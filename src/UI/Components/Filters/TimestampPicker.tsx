import React from "react";
import {
  TimePicker,
  DatePicker,
  isValidDate,
  yyyyMMddFormat,
} from "@patternfly/react-core";
import moment from "moment";

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
  const onDateChange = (inputDate, newDate) => {
    if (
      timestamp &&
      isValidDate(timestamp) &&
      isValidDate(newDate) &&
      inputDate === yyyyMMddFormat(newDate)
    ) {
      newDate.setHours(timestamp.getHours());
      newDate.setMinutes(timestamp.getMinutes());
    }
    if (isValidDate(newDate) && inputDate === yyyyMMddFormat(newDate)) {
      onChange(new Date(newDate));
    }
  };

  const onTimeChange = (time) => {
    if (timestamp && isValidDate(timestamp) && time.split(":").length === 2) {
      const [hour, minute] = time.split(":");
      const updatedDate = new Date(timestamp);
      updatedDate.setHours(hour);
      updatedDate.setMinutes(minute);
      onChange(updatedDate);
    }
  };

  return (
    <>
      <DatePicker
        value={
          timestamp && isValidDate(timestamp) ? yyyyMMddFormat(timestamp) : ""
        }
        onChange={onDateChange}
        rangeStart={from}
        aria-label={datePickerLabel}
      />
      <TimePicker
        style={{ width: "150px" }}
        onChange={onTimeChange}
        time={
          timestamp !== undefined
            ? moment(timestamp).format("HH:mm")
            : undefined
        }
        is24Hour
        isDisabled={!timestamp || !isValidDate(timestamp)}
        aria-label={timePickerLabel}
      />
    </>
  );
};
