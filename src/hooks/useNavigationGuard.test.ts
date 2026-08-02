import { createNavigationGuard } from './useNavigationGuard';

describe('createNavigationGuard', () => {
  it('navigates while the screen is focused', () => {
    const navigate = jest.fn();
    createNavigationGuard(() => true)(navigate);

    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('drops the tap once the screen has navigated away', () => {
    const navigate = jest.fn();
    createNavigationGuard(() => false)(navigate);

    expect(navigate).not.toHaveBeenCalled();
  });

  it('passes only the first of a double tap — focus flips after the first push', () => {
    const navigate = jest.fn();
    let focused = true;
    const guard = createNavigationGuard(() => focused);

    guard(() => {
      focused = false;
      navigate();
    });
    guard(navigate);

    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
