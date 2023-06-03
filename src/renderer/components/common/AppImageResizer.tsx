import React, { useState, useRef, FormEvent } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import DemoImage from './../../../../assets/Emmanuel.png';
import ReactCrop, {
  type Crop,
  type PixelCrop,
  type PercentCrop,
} from 'react-image-crop';

interface AppImageResizerProps {}

interface ImageAspectRatioProps {
  height: number;
  width: number;
}

const AppImageResizer: React.FC = (): JSX.Element => {
  const [crop, setCrop] = useState<Crop | any>();
  const imgRef = useRef<any>(null);
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageAspectRatio, setImageAspectRatio] =
    useState<ImageAspectRatioProps>({ height: 0, width: 0 });
  const [imageRotationAngle, setImageRotationAngle] = useState<number>(0);
  const [imageBrightness, setImageBrightness] = useState<number>(0);

  const handleImageBrightnessChange = (
    e: FormEvent<HTMLInputElement> | any
  ) => {
    console.log(e.target.value);
  };

  const handleImageRotationAngleChange = (
    e: FormEvent<HTMLInputElement> | any
  ) => {
    console.log(e.target.value);
  };

  const handleClick = () => {
    handleCropComplete();
  };

  const handleCropComplete = async () => {
    const canvas = getCroppedCanvas();
    const croppedFile = await canvasToFile(canvas, 'cropped-image.png');

    // Cast the croppedFile to Blob type
    const blob = croppedFile as Blob;

    // Create a temporary anchor element
    const anchor = document.createElement('a');
    anchor.href = window.URL.createObjectURL(blob);
    anchor.download = 'cropped-image.png';

    // Programmatically click the anchor element to initiate the download
    anchor.click();

    // Clean up the temporary anchor element
    window.URL.revokeObjectURL(anchor.href);
  };

  const getCroppedCanvas = () => {
    const imageElement = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = imageElement.naturalWidth / imageElement.width;
    const scaleY = imageElement.naturalHeight / imageElement.height;
    const { width, height, x, y } = crop;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx?.drawImage(
      imageElement,
      x * scaleX,
      y * scaleY,
      width * scaleX,
      height * scaleY,
      0,
      0,
      width,
      height
    );

    return canvas;
  };

  const canvasToFile = (canvas: HTMLCanvasElement, fileName: string) => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob: Blob | any) => {
          const file = new File([blob], fileName, { type: 'image/png' });
          resolve(file);
        },
        'image/png',
        1
      );
    });
  };

  const saveCroppedImage = (file: File, fileName: string) => {
    const filePath = '/path/to/save/file.png';
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const fileData = event.target.result;
      const values = {
        files: fileData,
        fileName: fileName,
      };
      window.electron.ipcRenderer.sendMessage('save-file', {
        values,
      });
      reader.readAsArrayBuffer(file);
    };

    window.electron.ipcRenderer.once(
      'save-file-response',
      (event, response: any) => {
        if (response.success) {
          // File saved successfully
          console.log('File saved:', response.filePath);
        } else {
          // Error saving file
          console.error('Error saving file:', response.error);
        }
      }
    );
  };
  return (
    <React.Fragment>
      <section className="app-image-resizer w-100 row ">
        <section className="app-image-resizer-control-panel col-3">
          <section className="resize-section mx-4">
            <section className="image-height-width row my-3">
              <Form.Group controlId="image-height" className="col-6">
                <Form.Control
                  type="number"
                  min="1"
                  name="image-height"
                  placeholder="height"
                  className="brand-small-text-2 height-input brand-white-text"
                />
              </Form.Group>

              <Form.Group controlId="image-width" className="col-6">
                <Form.Control
                  type="number"
                  min="1"
                  name="image-width"
                  placeholder="width"
                  className="brand-small-text-2 width-input brand-white-text"
                ></Form.Control>
              </Form.Group>
            </section>

            <section className="image-aspect-ratio w-100">
              <Form.Select
                name="image-aspect-ratio"
                className="brand-small-text-2 text-capitalize aspect-ratio brand-white-text "
              >
                <option value="1" className="text-capitalize">
                  Widescreen - 16.9
                </option>
                <option value="2" className="text-capitalize">
                  Smallscreen - 16.9
                </option>
                <option value="3" className="text-capitalize">
                  Largescreen - 16.9
                </option>
                <option value="4" className="text-capitalize">
                  Middlescreen - 16.9
                </option>
              </Form.Select>
            </section>
          </section>

          <section className="rotate-flip mx-4 my-5 d-flex  justify-content-around flex-column">
            <section className="rotate-and-flip d-flex align-items-start justify-content-start">
              <p className="text-start brand-white-text brand-small-text">
                Rotate and Flip
              </p>
            </section>
            <section className="rotate-flip-icons d-flex align-items-center justify-content-between w-100 my-2">
              <section className="rotate-icon-left brand-tooltip-color p-1 rounded shadow-sm rotate-icons d-flex align-items-center justify-content-center">
                <FontAwesomeIcon
                  icon={faRotateLeft}
                  size="1x"
                  className="text-light"
                />
              </section>

              <section className="rotate-icon-right brand-tooltip-color p-1 rounded shadow-sm rotate-icons d-flex align-items-center justify-content-center">
                <FontAwesomeIcon
                  icon={faRotateRight}
                  size="1x"
                  className="text-light"
                />
              </section>
            </section>

            <section className="rotate-flip-straightening my-3">
              <Form.Group>
                <Form.Label className="text-capitalize brand-small-text-2 text-muted">
                  Rotation
                </Form.Label>
                <Form.Range
                  className="custom-range"
                  onChange={(e) => {
                    handleImageRotationAngleChange(e);
                  }}
                  min={-360}
                  max={360}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label className="text-capitalize brand-small-text-2 text-muted">
                  brightness
                </Form.Label>
                <Form.Range
                  className="custom-range"
                  onChange={(e) => {
                    handleImageBrightnessChange(e);
                  }}
                  min={-100}
                  max={100}
                />
              </Form.Group>

              <section className="app-image-resizer-action-buttons d-flex align-items-center justify-content-start my-4">
                <Button
                  className="text-capitalize brand-small-text-2 btn-lg brand-button"
                  onClick={handleClick}
                >
                  save changes
                </Button>
              </section>
            </section>
          </section>
        </section>

        <section className="app-image-resizer-image col-7 d-flex align-items-center justify-content-center photo-editor rounded-3 mx-5">
          <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
            <img src={DemoImage} className="img-fluid" ref={imgRef} />
          </ReactCrop>
        </section>
        <section className="col-1"></section>

        <section className="spacer my-5 py-4"></section>
      </section>
    </React.Fragment>
  );
};

export default AppImageResizer;
// onComplete?: (crop: PixelCrop, percentageCrop: PercentCrop) => void;
