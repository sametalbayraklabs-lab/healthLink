'use client';

import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/tr';

interface TurkishDateCalendarProps {
    value: Dayjs | null;
    onChange: (date: Dayjs | null) => void;
    minDate?: Dayjs;
    maxDate?: Dayjs;
    sx?: object;
}

export default function TurkishDateCalendar({
    value,
    onChange,
    minDate,
    maxDate,
    sx,
}: TurkishDateCalendarProps) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
            <DateCalendar
                value={value}
                onChange={onChange}
                minDate={minDate}
                maxDate={maxDate}
                sx={sx}
            />
        </LocalizationProvider>
    );
}
