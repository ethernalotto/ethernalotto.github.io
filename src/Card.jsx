function formatNumber(value: number): string {
  return ('0' + value).slice(-2);
}

export const Card = ({date, numbers}) => (
  <div className="draws__item">
    <div className="draws__frame">
      <div className="draws__date">
        {formatNumber(date.getDate())}.{formatNumber(date.getMonth() + 1)}.{formatNumber(date.getFullYear())}
      </div>
      <div className="draws__main-shadow">
        <div className="draws__main">
          <div className="my-numbers__out">
            <div className="my-numbers">
              <div className="my-numbers__title">Numbers</div>
              <div className="my-numbers__body">
                {numbers.map((number, index) => (
                  <div key={index} className="my-numbers__item">
                    <span className="my-numbers__text">{number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="prize">
          </div>
        </div>
      </div>
    </div>
  </div>
);
