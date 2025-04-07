import { dia, ui } from '@inmanta/rappid';
import { fireEvent, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { defineObjectsForJointJS } from '../testSetup';
import { ZoomHandlerService } from './zoomHandler';

// parts of the ZoomHandlerService that aren't covered are related to the getElementById() which isn't supported by jest, this part is covered by the E2E tests scenario 8.1
describe('ZoomHandler', () => {
  defineObjectsForJointJS();
  const canvas = document.createElement('div');
  const zoom = document.createElement('div');
  const wrapper = document.createElement('div');

  const graph = new dia.Graph();
  const paper = new dia.Paper({
    el: canvas,
    model: graph,
  });
  const scroller = new ui.PaperScroller({
    paper,
  });

  const zoomHandler = new ZoomHandlerService(zoom, scroller);

  wrapper.appendChild(zoom);
  document.body.appendChild(zoom);
  it('should render zoom handler', () => {
    expect(screen.getByTestId('zoomHandler')).toBeInTheDocument();
  });

  it('should fire requestFullscreen() function when clicking fullscreen button', async () => {
    //jest + jsdom doesn't implement the fullscreen API, they are mocked in the testSetup()
    const fullScreenSpy = jest.spyOn(
      document.documentElement,
      'requestFullscreen',
    );

    const fullscreenButton = screen.getByTestId('fullscreen');

    await userEvent.click(fullscreenButton);

    expect(fullScreenSpy).toHaveBeenCalled();
  });

  it('should fire exitFullscreen() function when clicking fullscreen button and the fullscreenElement exist', async () => {
    //mock that fullscreen is active, by default it's null
    Object.defineProperty(document, 'fullscreenElement', {
      writable: false,
      value: {},
    });
    //jest + jsdom doesn't implement the fullscreen API, they are mocked in the testSetup()
    const exitFullScreenSpy = jest.spyOn(document, 'exitFullscreen');

    const fullscreenButton = screen.getByTestId('fullscreen');

    await userEvent.click(fullscreenButton);

    expect(exitFullScreenSpy).toHaveBeenCalled();
  });

  it('should fire scroller\'s function zoomToFit() when clicking fit-to-screen button', async () => {
    //we aren't testing the zoomToFit function itself as that is part of JointJS which use logic that isn't supported by Jest
    const zoomToFit = jest.spyOn(scroller, 'zoomToFit');

    const fitToScreenButton = screen.getByTestId('fit-to-screen');

    await userEvent.click(fitToScreenButton);

    expect(zoomToFit).toHaveBeenCalled();
  });

  it('should update slider input & output element when slider is triggered', async () => {
    const initialSliderOutput = screen.getByTestId('slider-output');

    expect(initialSliderOutput).toHaveTextContent('100');

    const sliderInput = screen.getByTestId('slider-input');

    //userEvent doesn't have a interaction that allows sliding the slider, so we need to use fireEvent
    fireEvent.change(sliderInput, { target: { value: 120 } });
    const sliderOutput = screen.getByTestId('slider-output');

    expect(sliderOutput).toHaveTextContent('120');
  });

  it('should remove zoomHandler from the dom when remove() method is fired', async () => {
    zoomHandler.remove();

    expect(screen.queryByTestId('zoomHandler')).not.toBeInTheDocument();
  });
});
