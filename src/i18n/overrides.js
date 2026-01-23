import { reactive } from 'vue';

const overrideFormats = reactive({});

export const setOverrideFormats = (formats = {}) => {
  Object.keys(overrideFormats).forEach((key) => {
    delete overrideFormats[key];
  });

  Object.entries(formats).forEach(([key, format]) => {
    if (format) {
      overrideFormats[key] = format;
    }
  });
};

export const getOverrideFormat = (key) => overrideFormats[key] || 'plain';

export const getOverrideFormats = () => overrideFormats;
